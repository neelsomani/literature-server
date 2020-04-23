import json
import uuid
import time

import gevent
from literature import get_game

from constants import *


class LiteratureAPI:
    """
    Interface for registering and updating WebSocket clients
    for a given game.
    """

    def __init__(self,
                 unique_id,
                 logger,
                 n_players,
                 time_limit=30):
        self.unique_id = unique_id
        self.clients = {}
        self.game = get_game(n_players)
        self.logger = logger
        self.n_players = n_players
        self.current_players = 0
        self.move_timestamp = 0
        self.time_limit = time_limit
        self.logger.info('Initialized game {}'.format(unique_id))

    def register(self, client):
        """ Register a WebSocket connection for updates. """
        if self.current_players == self.n_players:
            self.send(client, {
                'action': REGISTER,
                'success': False
            })
            return

        self.current_players += 1
        u_id = uuid.uuid4().hex
        while u_id in self.clients:
            u_id = uuid.uuid4().hex
        self.clients[u_id] = client
        self.send(client, {
            'action': REGISTER,
            'success': True,
            'uuid': u_id
        })
        self.logger.info('Registered user {}'.format(u_id))

        if self.current_players == self.n_players:
            self.logger.info('Received {} players for game {}'.format(
                self.n_players, self.unique_id
            ))
            self.move_timestamp = time.time()
            self._send_updated_game_state()

    def send(self, client, data):
        """
        Send given data to the registered client. Automatically discard invalid
        connections.
        """
        try:
            client.send(json.dumps(data))
        except:
            for u_id in self.clients:
                if self.clients[u_id] == client:
                    del self.clients[u_id]
            # TODO(@neel): Replace disconnected player with bot.

    def send_all(self, message):
        """ Send a message to all clients. """
        data = message.get('data')
        if message['type'] == 'message':
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def handle_message(self, message):
        action_map = {
            CLAIM: self._claim,
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
        """
        Evaluate whether a player's claim is valid.
        Send the whether the player was correct in addition
        to the correct pairings to all players.
        """
        pass

    def _move(self, payload):
        """
        Execute a move for a player.
        """
        pass

    def _switch_team(self, payload):
        """
        Check if the current player's time is up. If so,
        switch the team and send the players the updated
        game state.
        """
        pass

    def _send_updated_game_state(self):
        """
        Send all necessary info to players for the beginning
        of the turn.
        """
        self._send_last_move()
        self._send_hands()

    def _send_last_move(self):
        """
        Send the last move and each player's number of cards to
        all players.
        """
        pass

    def _send_hands(self):
        """
        Send each player their hand.
        """
        pass

    def _send_complete(self):
        """
        Send that the game is in a finished state to all players.
        """
        pass

    def _send_score(self):
        """
        Send the updated score to all players.
        """
        pass
