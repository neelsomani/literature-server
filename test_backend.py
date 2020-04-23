import gevent
import json
import logging
import pytest
import time

import literature
from literature import (
    Card,
    Half,
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
        self.messages.append(data)


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
    msg = json.loads(c.messages[0])
    assert msg['payload']['success'] and 'uuid' in msg['payload']


def test_full_room(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    c = MockClient()
    api.register(c)
    msg = json.loads(c.messages[0])
    assert not msg['payload']['success']
    for i in clients:
        assert len(i.messages) == 3
        assert json.loads(i.messages[0])['action'] == REGISTER
        recv_actions = {
            json.loads(i.messages[1])['action'],
            json.loads(i.messages[2])['action']
        }
        assert HAND in recv_actions and LAST_MOVE in recv_actions


def _last_move_from_messages(messages):
    for m in messages:
        msg = json.loads(m)
        if msg['action'] == LAST_MOVE:
            return msg['payload']
    raise ValueError('Last move not received')


def test_switching_turn(monkeypatch, initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 3

    # Get the current turn
    turn = _last_move_from_messages(clients[-1].messages)['turn']
    assert turn == 0

    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 5

    current_turn = _last_move_from_messages(clients[-1].messages[-2:])['turn']
    assert current_turn == 1


def test_make_move(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    p0_key = None
    for i in clients:
        reg_msg = json.loads(i.messages[0])
        if api.users[reg_msg['payload']['uuid']].player_n == 0:
            p0_key = reg_msg['payload']['uuid']
    if not p0_key:
        raise ValueError('Player 0 not found')
    assert len(clients[0].messages) == 3
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': p0_key,
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    assert len(clients[0].messages) == 5
    move = _last_move_from_messages(clients[-1].messages[-2:])
    assert move['success']
    assert move['interrogator'] == 0
    assert move['respondent'] == 1
    assert move['success']
    assert move['card'] == MISSING_CARD.serialize()
    assert move['turn'] == 0
