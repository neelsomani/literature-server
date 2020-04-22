import json

import gevent

from constants import *


class LiteratureAPI:
    """
    Interface for registering and updating WebSocket clients
    for a given game.

    TODO(@neel): Add authentication keys for users.
    Send authentication key when the client registers.
    TODO(@neel): Add move_timestamp + game parameters such as time limit.
    # Add n_players and start the game when enough players are connected.
    TODO(@neel): Implement API.
    """

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
        to the correct matchings to all players.
        """
        raise NotImplementedError

    def _move(self, payload):
        """
        Execute a move for a player.
        """
        raise NotImplementedError

    def _switch_team(self, payload):
        """
        Check if the current player's time is up. If so,
        switch the team and send the players the updated
        game state.
        """
        raise NotImplementedError

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
        raise NotImplementedError

    def _send_hands(self):
        """
        Send each player their hand.
        """
        raise NotImplementedError

    def _send_complete(self):
        """
        Send that the game is in a finished state to all players.
        """
        raise NotImplementedError

    def _send_score(self):
        """
        Send the updated score to all players.
        """
        raise NotImplementedError
