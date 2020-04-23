from collections import namedtuple
import json
import time
import uuid

import gevent
import literature

from constants import *


User = namedtuple('User', ['socket', 'player_n'])


class LiteratureAPI:
    """
    Interface for registering and updating WebSocket clients
    for a given game.
    """

    def __init__(self,
                 u_id,
                 logger,
                 n_players,
                 time_limit=30):
        self.u_id = u_id
        self.users = {}
        self.game = literature.get_game(n_players)
        self.logger = logger
        self.n_players = n_players
        self.current_players = 0
        # `last_executed_move` is the timestamp of the last executed move,
        # used to determine if this game is inactive.
        self.last_executed_move = 0
        # `move_timestamp` gives the base time for the current time limit,
        # which might be later than the `last_executed_move` if the turn is
        # forcibly switched.
        self.move_timestamp = 0
        self.time_limit = time_limit
        self.logger.info('Initialized game {}'.format(u_id))

    def register(self, client):
        """ Register a WebSocket connection for updates. """
        if self.current_players == self.n_players:
            self._send(client, {
                'action': REGISTER,
                'payload': {
                    'success': False
                }
            })
            return

        self.current_players += 1
        u_id = uuid.uuid4().hex
        while u_id in self.users:
            u_id = uuid.uuid4().hex
        # Player numbers start at 0
        self.users[u_id] = User(socket=client,
                                player_n=self.current_players - 1)
        self._send(client, {
            'action': REGISTER,
            'payload': {
                'success': True,
                'uuid': u_id
            }
        })
        self.logger.info('Registered user {}'.format(u_id))

        if self.current_players == self.n_players:
            self.logger.info('Received {} players for game {}'.format(
                self.n_players, self.u_id
            ))
            current_time = time.time()
            self.move_timestamp = current_time
            self.last_executed_move = current_time
            self._send_updated_game_state()

    def _send(self, client, data):
        """
        Send given data to the registered client. Automatically discard invalid
        connections.
        """
        try:
            client.send(json.dumps(data))
        except:
            for u_id in self.users:
                if self.users[u_id].socket == client:
                    del self.users[u_id]
                    self.logger('Player {} has disconnected from game {}'
                                .format(u_id, self.u_id))
            # TODO(@neel): Replace disconnected player with bot.

    def _send_all(self, message):
        """ Send a message to all clients. """
        for user in self.users.values():
            gevent.spawn(self._send, user.socket, message)

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
        if payload.get('key', '') not in self.users:
            return
        interrogator = self.users[payload['key']].player_n
        respondent = int(payload['respondent'])
        card_str = payload['card']
        card = literature.deserialize(card_str[:-1], card_str[-1])
        self.game.commit_move(
            self.game.players[interrogator].asks(self.game.players[respondent])
                .to_give(card)
        )
        self._send_updated_game_state()

    def _switch_team(self, _):
        """
        Check if the current player's time is up. If so,
        switch the team and send the players the updated
        game state.
        """
        current_time = time.time()
        if abs(current_time - self.move_timestamp) >= self.time_limit:
            # If we're able to switch the turn, then do it.
            if self.game.switch_turn():
                self.move_timestamp = current_time
                self._send_updated_game_state()

    def _send_updated_game_state(self):
        """
        Send all necessary info to players for the beginning
        of the turn.
        """
        self._send_last_move()
        self._send_hands()

    def _with_player_info(self, payload):
        """
        Add the `move_timestamp` and `n_cards` to the dictionary.
        """
        payload.update({
            'move_timestamp': self.move_timestamp,
            'n_cards': {
                i.unique_id: len(i.hand) for i in self.game.players
            }
        })
        return payload

    def _send_last_move(self):
        """
        Send the last move, the current player's turn, and each player's number
        of cards to all players.

        The included fields are:
        - `interrogator`
        - `respondent`
        - `card`
        - `success`
        - `turn`
        - `move_timestamp`
        - `n_cards`

        If the game has just started, then `interrogator`, `respondent`, `card`,
        and `success` will not be included.
        """
        # If there have been no moves executed, then the game has just started.
        if len(self.game.move_ledger) == 0:
            self._send_all({
                'action': LAST_MOVE,
                'payload': self._with_player_info({
                    'turn': self.game.turn.unique_id
                })
            })
            return

        last_move, move_success = (
            self.game.move_ledger[-1],
            self.game.move_success[-1]
        )
        self._send_all({
            'action': LAST_MOVE,
            'payload': self._with_player_info({
                'turn': self.game.turn.unique_id,
                'interrogator': last_move.interrogator.unique_id,
                'respondent': last_move.respondent.unique_id,
                'card': last_move.card.serialize(),
                'success': move_success
            })
        })

    def _send_hands(self):
        """
        Send each player their hand.

        The payload will be a list with the serialized representation
        of each card.
        """
        for user in self.users.values():
            idx = user.player_n
            player = self.game.players[idx]
            self._send(user.socket, {
                'action': HAND,
                'payload': [c.serialize() for c in player.hand]
            })

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
