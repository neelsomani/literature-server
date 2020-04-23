import json
import logging
import pytest

from backend import LiteratureAPI
from constants import *

MOCK_UNIQUE_ID = 1


class MockClient:
    def __init__(self):
        self.messages = []

    def send(self, data):
        self.messages.append(data)


@pytest.fixture()
def api():
    # Pick the first player to start
    return LiteratureAPI(
        unique_id=MOCK_UNIQUE_ID,
        logger=logging.getLogger(__name__),
        n_players=4,
        time_limit=30
    )


def test_registration(api):
    c = MockClient()
    api.register(c)
    assert len(c.messages) == 1
    msg = json.loads(c.messages[0])
    assert msg['success'] and 'uuid' in msg


def test_full_room(api):
    in_room = []
    for _ in range(4):
        in_room.append(MockClient())
        api.register(in_room[-1])
    c = MockClient()
    api.register(c)
    msg = json.loads(c.messages[0])
    assert not msg['success']
    for i in in_room:
        assert len(i.messages) == 3
        assert json.loads(i.messages[0])['action'] == REGISTER
        recv_actions = {
            json.loads(i.messages[1])['action'],
            json.loads(i.messages[2])['action']
        }
        assert HAND in recv_actions and LAST_MOVE in recv_actions

