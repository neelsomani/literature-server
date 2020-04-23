import gevent
import json
import logging
import pytest
import time

from backend import LiteratureAPI
from constants import *

MOCK_UNIQUE_ID = 1


class MockClient:
    def __init__(self):
        self.messages = []

    def send(self, data):
        self.messages.append(data)


def sync_exec(fn, *args):
    return fn(*args)


@pytest.fixture()
def api(monkeypatch):
    # gevent does not execute for tests
    monkeypatch.setattr(gevent, 'spawn', sync_exec)
    monkeypatch.setattr(time, 'time', lambda: 0)
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
    assert msg['success'] and 'uuid' in msg


def test_full_room(initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    c = MockClient()
    api.register(c)
    msg = json.loads(c.messages[0])
    assert not msg['success']
    for i in clients:
        assert len(i.messages) == 3
        assert json.loads(i.messages[0])['action'] == REGISTER
        recv_actions = {
            json.loads(i.messages[1])['action'],
            json.loads(i.messages[2])['action']
        }
        assert HAND in recv_actions and LAST_MOVE in recv_actions


def _turn_from_messages(messages):
    for m in messages:
        msg = json.loads(m)
        if msg['action'] == LAST_MOVE:
            return msg['payload']['turn']
    raise ValueError('Last move not received')


def test_switching_turn(monkeypatch, initialized_room):
    api, clients = initialized_room['api'], initialized_room['clients']
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 3

    # Get the current turn
    turn = _turn_from_messages(clients[-1].messages)

    monkeypatch.setattr(time, 'time', lambda: 45)
    api.handle_message({'action': SWITCH_TEAM})
    for i in clients:
        assert len(i.messages) == 5

    current_turn = _turn_from_messages(clients[-1].messages[-2:])
    assert current_turn % 2 != turn % 2
