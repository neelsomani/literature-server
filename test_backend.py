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

from backend import (
    LiteratureAPI,
    RoomManager,
    User,
    VISITOR_PLAYER_ID
)
from constants import *
import util

MOCK_UNIQUE_ID = '1'
MOCK_NAME = 'John'
MISSING_CARD = Card.Name(3, Suit.CLUBS)
TIME_LIMIT = 30
N_PLAYERS = 4


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


def mock_get_game(n_players):
    return Literature(n_players=n_players,
                      hands_fn=two_player_mock,
                      turn_picker=lambda: 0)


def mock_schedule(interval, func, repeat=False):
    return lambda: None


@pytest.fixture()
def setup_mocking(monkeypatch):
    # gevent does not execute for tests
    monkeypatch.setattr(gevent, 'spawn', sync_exec)
    monkeypatch.setattr(time, 'time', lambda: 0)
    monkeypatch.setattr(literature, 'get_game', mock_get_game)
    monkeypatch.setattr(util, 'schedule', mock_schedule)


@pytest.fixture()
def api(monkeypatch, setup_mocking):
    # Pick the first player to start
    return LiteratureAPI(
        game_uuid=MOCK_UNIQUE_ID,
        logger=logging.getLogger(__name__),
        n_players=N_PLAYERS,
        time_limit=TIME_LIMIT
    )


@pytest.fixture()
def initialized_room(api):
    in_room = []
    for _ in range(N_PLAYERS):
        in_room.append(MockClient())
        api.register_new_player(in_room[-1], None)
    return {
        'clients': in_room,
        'api': api
    }


def test_registration(api):
    c = MockClient()
    api.register_new_player(c, MOCK_NAME)
    # Registration + player_names message
    assert len(c.messages) == 2
    msg = _action_from_messages(c.messages, REGISTER)
    assert msg['player_n'] != VISITOR_PLAYER_ID
    player_uuid = msg['player_uuid']
    game_uuid = msg['game_uuid']
    assert msg['time_limit'] == TIME_LIMIT
    assert msg['n_players'] == N_PLAYERS
    msg = _action_from_messages(c.messages, PLAYER_NAMES)
    assert msg['names']['0'] == MOCK_NAME
    api.handle_message({
        'action': PING_PONG,
        'game_uuid': game_uuid,
        'payload': {
            'key': player_uuid
        }
    })
    assert c.messages[-1]['action'] == PING_PONG


def _action_from_messages(messages, action):
    for msg in messages:
        if msg['action'] == action:
            return msg['payload']
    raise ValueError('Action {} not received'.format(action))


def test_full_room(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    for i in clients:
        assert len(_filter_name_updates(i.messages)) == 3
        recv_actions = {m['action'] for m in i.messages}
        assert REGISTER in recv_actions
        assert HAND in recv_actions
        assert LAST_MOVE in recv_actions
        assert PLAYER_NAMES in recv_actions
    c = MockClient()
    api.register_new_player(c, None)
    msg = _action_from_messages(c.messages, REGISTER)
    assert msg['player_n'] == VISITOR_PLAYER_ID
    # The visitor should still receive the last move
    for action in [REGISTER, LAST_MOVE, PLAYER_NAMES]:
        _action_from_messages(c.messages, action)
    with pytest.raises(ValueError):
        _action_from_messages(c.messages, HAND)


def test_switching_turn(monkeypatch, initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        # Message for registration, last_move, and hand
        assert len(_filter_name_updates(i.messages)) == 3

    # Get the current turn
    turn = _action_from_messages(clients[0].messages, LAST_MOVE)['turn']
    assert turn == 0

    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(_filter_name_updates(i.messages)) == 5

    current_turn = _action_from_messages(
        clients[0].messages[-2:], LAST_MOVE
    )['turn']
    assert current_turn == 1


def test_switch_turn_before_start(monkeypatch, api):
    c = MockClient()
    api.register_new_player(c, None)
    assert len(_filter_name_updates(c.messages)) == 1
    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    assert len(_filter_name_updates(c.messages)) == 1


def _get_p0_key(clients):
    for i in clients:
        reg_msg = i.messages[0]
        if reg_msg['payload']['player_n'] == 0:
            return reg_msg['payload']['player_uuid']
    raise ValueError('Player 0 not found')


def _filter_name_updates(messages):
    return [m for m in messages if m['action'] != PLAYER_NAMES]


def test_make_move(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    assert len(_filter_name_updates(clients[0].messages)) == 3
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': _get_p0_key(clients),
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    assert len(_filter_name_updates(clients[0].messages)) == 5
    move = _action_from_messages(clients[0].messages[-2:], LAST_MOVE)
    assert move['success']
    assert move['interrogator'] == 0
    assert move['respondent'] == 1
    assert move['card'] == MISSING_CARD.serialize()
    assert move['turn'] == 0


def test_claim(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    claim = api.game.players[0].evaluate_claims()[
        HalfSuit(Half.MINOR, Suit.DIAMONDS)
    ]
    api.handle_message({
        'action': CLAIM,
        'payload': {
            'key': _get_p0_key(clients),
            'possessions': {
                c.serialize(): p.unique_id for c, p in claim.items()
            }
        }
    })
    assert len(_filter_name_updates(clients[0].messages)) == 5
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
    p0_key = _get_p0_key(clients)
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


def test_rooms(setup_mocking):
    rm = RoomManager(logging.getLogger(__name__))
    new_room_client = MockClient()
    rm.join_game(new_room_client,
                 player_uuid=None,
                 game_uuid=None,
                 n_players=N_PLAYERS)
    msg = _action_from_messages(new_room_client.messages, REGISTER)
    assert msg['player_n'] != VISITOR_PLAYER_ID
    same_room_client = MockClient()
    game_uuid = msg['game_uuid']
    player_uuid = msg['player_uuid']
    rm.join_game(same_room_client,
                 player_uuid=None,
                 game_uuid=game_uuid,
                 n_players=None)
    msg = _action_from_messages(same_room_client.messages, REGISTER)
    assert msg['player_n'] != VISITOR_PLAYER_ID and \
        msg['game_uuid'] == game_uuid and \
        msg['player_uuid'] != player_uuid
    player_reconnected = MockClient()
    rm.join_game(player_reconnected,
                 player_uuid=player_uuid,
                 game_uuid=game_uuid,
                 n_players=None)
    msg = _action_from_messages(player_reconnected.messages, REGISTER)
    assert msg['player_n'] != VISITOR_PLAYER_ID and \
        msg['game_uuid'] == game_uuid and \
        msg['player_uuid'] == player_uuid


def test_room_deletion(monkeypatch, setup_mocking):
    rm = RoomManager(logging.getLogger(__name__))
    new_room_client = MockClient()
    rm.join_game(new_room_client,
                 player_uuid=None,
                 game_uuid=None,
                 n_players=N_PLAYERS)
    assert len(rm.games) == 1
    assert list(rm.games.values())[0].last_executed_move == 0
    monkeypatch.setattr(time, 'time', lambda: 5 * 60)
    rm.delete_unused_rooms()
    assert len(rm.games) == 1
    monkeypatch.setattr(time, 'time', lambda: 15 * 60)
    rm.delete_unused_rooms()
    assert len(rm.games) == 0


def test_bot_moves(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    assert len(api.game.actual_possessions) == 0
    # Turn player 0 into a bot by breaking the WebSocket
    for c in clients:
        if c.messages[0]['payload']['player_n'] == 0:
            c.send = util.BotClient.send
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': _get_p0_key(clients),
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    api.execute_bot_moves()
    assert len(api.game.actual_possessions) == 1
    api.execute_bot_moves()
    assert len(api.game.actual_possessions) == 2


def test_start_game(api):
    c = MockClient()
    api.register_new_player(c, None)
    assert api.current_players == 1
    api.handle_message({
        'action': START_GAME,
        'payload': {}
    })
    assert api.current_players == 1
    api.handle_message({
        'action': START_GAME,
        'payload': {
            'key': c.messages[0]['payload']['player_uuid']
        }
    })
    assert api.current_players == 4


def test_name_updates(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    for c in clients:
        names = _action_from_messages(c.messages[-3:], PLAYER_NAMES)
        for k, n in names['names'].items():
            assert n == 'Player {}'.format(k)
    clients[1].send = util.BotClient.send
    api.handle_message({
        'action': MOVE,
        'payload': {
            'key': _get_p0_key(clients),
            'respondent': 1,
            'card': MISSING_CARD.serialize()
        }
    })
    for i, c in enumerate(clients):
        if i == 1:
            continue
        names = _action_from_messages(c.messages[-3:], PLAYER_NAMES)
        assert names['names']['1'] == 'Bot 1'


def test_user_object():
    no_name = User(MockClient(), 1, True, '')
    assert no_name.username == 'Player 1'
    real_name = User(MockClient(), 2, True, MOCK_NAME)
    assert real_name.username == MOCK_NAME
    real_name.connected = False
    assert real_name.username == 'Bot 2'
    long_string = 'a' * 30
    real_name.username = long_string
    assert len(real_name.username) <= 20
