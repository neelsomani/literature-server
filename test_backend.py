import gevent
import json
import logging
import pytest
import time

import literature
from literature import (
    Card,
    Half,
    HalfSuit,
    Literature,
    SETS,
    Suit
)

from backend import LiteratureAPI
from constants import *

MOCK_UNIQUE_ID = 1
MISSING_CARD = Card.Name(3, Suit.CLUBS)


class MockClient:
    def __init__(self):
        self.messages = []

    def send(self, data):
        self.messages.append(json.loads(data))


def sync_exec(fn, *args):
    return fn(*args)


def two_player_mock(_):
    p0_cards = [Card.Name(r, s) for r in SETS[Half.MINOR] for s in Suit]
    p0_cards.remove(MISSING_CARD)
    return [
        p0_cards,
        [
            Card.Name(r, s) for r in SETS[Half.MAJOR] for s in Suit
        ] + [MISSING_CARD],
        [],
        []
    ]


def mock_get_game(_):
    return Literature(n_players=4,
                      hands_fn=two_player_mock,
                      turn_picker=lambda: 0)


@pytest.fixture()
def api(monkeypatch):
    # gevent does not execute for tests
    monkeypatch.setattr(gevent, 'spawn', sync_exec)
    monkeypatch.setattr(time, 'time', lambda: 0)
    monkeypatch.setattr(literature, 'get_game', mock_get_game)
    # Pick the first player to start
    return LiteratureAPI(
        u_id=MOCK_UNIQUE_ID,
        logger=logging.getLogger(__name__),
        n_players=4,
        time_limit=30
    )


@pytest.fixture()
def initialized_room(api):
    in_room = []
    for _ in range(4):
        in_room.append(MockClient())
        api.register(in_room[-1])
    return {
        'clients': in_room,
        'api': api
    }


def test_registration(api):
    c = MockClient()
    api.register(c)
    assert len(c.messages) == 1
    msg = c.messages[0]
    assert msg['payload']['success'] and 'uuid' in msg['payload']


def test_full_room(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    c = MockClient()
    api.register(c)
    msg = c.messages[0]
    assert not msg['payload']['success']
    for i in clients:
        assert len(i.messages) == 3
        assert i.messages[0]['action'] == REGISTER
        recv_actions = {
            i.messages[1]['action'],
            i.messages[2]['action']
        }
        assert HAND in recv_actions and LAST_MOVE in recv_actions


def _action_from_messages(messages, action):
    for msg in messages:
        if msg['action'] == action:
            return msg['payload']
    raise ValueError('Last move not received')


def test_switching_turn(monkeypatch, initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 3

    # Get the current turn
    turn = _action_from_messages(clients[0].messages, LAST_MOVE)['turn']
    assert turn == 0

    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 5

    current_turn = _action_from_messages(
        clients[0].messages[-2:], LAST_MOVE
    )['turn']
    assert current_turn == 1


def _get_p0_key(api, clients):
    for i in clients:
        reg_msg = i.messages[0]
        if api.users[reg_msg['payload']['uuid']].player_n == 0:
            return reg_msg['payload']['uuid']
    raise ValueError('Player 0 not found')


def test_make_move(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    assert len(clients[0].messages) == 3
    p0_key = _get_p0_key(api, clients)
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': p0_key,
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    assert len(clients[0].messages) == 5
    move = _action_from_messages(clients[0].messages[-2:], LAST_MOVE)
    assert move['success']
    assert move['interrogator'] == 0
    assert move['respondent'] == 1
    assert move['success']
    assert move['card'] == MISSING_CARD.serialize()
    assert move['turn'] == 0


def test_claim(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    p0_key = _get_p0_key(api, clients)
    claim = api.game.players[0].evaluate_claims()[
        HalfSuit(Half.MINOR, Suit.DIAMONDS)
    ]
    api.handle_message({
        'action': CLAIM,
        'payload': {
            'key': p0_key,
            'possessions': {
                c.serialize(): p.unique_id for c, p in claim.items()
            }
        }
    })
    assert len(clients[0].messages) == 5
    payload = _action_from_messages(clients[0].messages[-2:], CLAIM)
    assert payload['claim_by'] == 0
    assert payload['half_suit']['half'] == 'minor'
    assert payload['half_suit']['suit'] == 'D'
    assert payload['turn'] == 0
    assert payload['success']
    assert payload['score']['even'] == 1
    assert payload['score']['odd'] == 0


def test_game_complete(monkeypatch, initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    p0_key = _get_p0_key(api, clients)
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': p0_key,
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    for claim in api.game.players[0].evaluate_claims().values():
        api.handle_message({
            'action': CLAIM,
            'payload': {
                'key': p0_key,
                'possessions': {
                    c.serialize(): p.unique_id for c, p in claim.items()
                }
            }
        })
    assert api.game.players[0].has_no_cards()\
        and api.game.players[2].has_no_cards()
    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    assert api.game.turn == 1
    monkeypatch.setattr(time, 'time', lambda: 90)
    api.handle_message({'action': SWITCH_TEAM})
    msg = clients[0].messages[-1]
    assert msg['action'] == COMPLETE
