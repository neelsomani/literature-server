import json

import gevent

from constants import *


class LiteratureAPI:
    """ Interface for registering and updating WebSocket clients. """

    def __init__(self, logger):
        self.clients = list()
        self.logger = logger

    def register(self, client):
        """ Register a WebSocket connection for updates. """
        self.clients.append(client)

    def send(self, client, data):
        """
        Send given data to the registered client. Automatically discard invalid
        connections.
        """
        try:
            client.send(data)
        except:
            self.clients.remove(client)

    def send_all(self, message):
        """ Send a message to all clients. """
        data = message.get('data')
        if message['type'] == 'message':
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def handle_message(self, message):
        action_map = {
            CLAIM: self._claim,
            HAND: self._hand,
            MOVE: self._move,
            SWITCH_TEAM: self._switch_team
        }
        fn = action_map[message.get('action', '')]
        if fn is None:
            self.logger.exception(
                'Received bad action for message: {}'
                .format(json.dumps(message))
            )
            return
        fn(message.get('payload', {}))

    def _claim(self, payload):
        pass

    def _hand(self, payload):
        pass

    def _move(self, payload):
        pass

    def _switch_team(self, payload):
        pass
