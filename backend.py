import json
import time
import uuid

import gevent
import literature

from constants import *

VISITOR_PLAYER_ID = -1


class RoomManager:
    VALID_N_PLAYERS = {4, 6, 8}
    DEFAULT_N_PLAYERS = 4
    DELETE_ROOMS_AFTER_MIN = 10

    def __init__(self):
        self.games = {}

    def handle_message(self, message, logger):
        game = self.games.get(message['game_uuid'])
        if game is None:
            logger.exception(
                'Invalid game_uuid: {}'.format(json.dumps(message))
            )
            return
        game.handle_message(message)

    @classmethod
    def _parse_n_players(cls, n_players, logger):
        try:
            n = int(n_players)
            if n in cls.VALID_N_PLAYERS:
                return n
        except ValueError:
            logger.info('Could not parse n_players: {}'.format(n_players))
        return cls.DEFAULT_N_PLAYERS

    def join_game(self,
                  client,
                  logger,
                  player_uuid=None,
                  game_uuid=None,
                  n_players=DEFAULT_N_PLAYERS):
        """
        Register a WebSocket connection for updates.

        Handle initial payload from WebSocket, which can contain:
        - game_uuid
        - player_uuid
        - n_players

        Order of priorities:
        1. Reconnect as player `player_uuid` to game `game_uuid` if possible.
        2. Attempt connecting to `game_uuid` as any player.
        3. Create new game with `n_players`.
        """

        if game_uuid in self.games:
            if player_uuid in self.games[game_uuid].users:
                # Connect as this player to the game.
                player = self.games[game_uuid].users[player_uuid]
                player.connected = True
                player.socket = client
                self.games[game_uuid].register_with_uuid(player_uuid)
            else:
                self.games[game_uuid].register_new_player(client)
            return

        n_players = RoomManager._parse_n_players(n_players, logger)
        game_uuid = _uuid(self.games)
        self.games[game_uuid] = LiteratureAPI(game_uuid=game_uuid,
                                              logger=logger,
                                              n_players=n_players,
                                              time_limit=60)
        self.games[game_uuid].register_new_player(client)

    def delete_unused_rooms(self):
        """ Delete rooms that have not executed a move in the last
        10 minutes. """
        for g in list(self.games.keys()):
            if self.games[g].last_executed_move \
                    + self.DELETE_ROOMS_AFTER_MIN * 60 <= time.time():
                del self.games[g]


class User:
    def __init__(self, socket, player_n, connected):
        self.socket = socket
        self.player_n = player_n
        self.connected = connected


class LiteratureAPI:
    """
    Interface for registering and updating WebSocket clients
    for a given game.
    """

    def __init__(self,
                 game_uuid,
                 logger,
                 n_players,
                 time_limit=60):
        """
        Parameters
        ----------
        game_uuid : str
            Unique ID for this game instance
        logger : logging.Logger
            Logger for debug messages
        n_players : int
            Number of players for the game
        time_limit : int
            Number of seconds between each turn. Defaults to 60.
        """
        self.uuid = game_uuid
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
        self.logger.info('Initialized game {}'.format(game_uuid))

    def register_new_player(self, client):
        """ Register a new user for this game. """
        connected = False
        if self.current_players >= self.n_players:
            player_n = VISITOR_PLAYER_ID
        else:
            connected = True
            player_n = self.current_players

        self.current_players += 1
        player_uuid = _uuid(self.users)
        self.users[player_uuid] = User(socket=client,
                                       player_n=player_n,
                                       connected=connected)
        self.register_with_uuid(player_uuid)

    def register_with_uuid(self, player_uuid):
        """
        Send the client the info for the specified `player_uuid`.
        The `player_uuid` must already be present in `self.players`.
        """
        payload = {
            'n_players': self.n_players,
            'time_limit': self.time_limit,
            'player_n': self.users[player_uuid].player_n,
            'player_uuid': player_uuid,
            'game_uuid': self.uuid
        }
        gevent.spawn(self._send, self.users[player_uuid].socket, {
            'action': REGISTER,
            'payload': payload
        })
        self.logger.info('Sent registration to user {}'.format(player_uuid))

        if self.current_players == self.n_players:
            self.logger.info('Received {} players for game {}'.format(
                self.n_players, self.uuid
            ))
            current_time = time.time()
            self.move_timestamp = current_time
            self.last_executed_move = current_time

        # Send the latest game state to all players if we have the minimum
        # number of players.
        if self.current_players >= self.n_players:
            self._send_updated_game_state()

    def _send(self, client, data):
        """
        Send given data to the registered client. Automatically discard invalid
        connections.
        """
        serialized = json.dumps(data)
        try:
            client.send(serialized)
        except:
            for player_uuid in self.users:
                if self.users[player_uuid].socket == client:
                    self.users[player_uuid].connected = False
                    self.logger.info('Player {} is disconnected from game {}'
                                     .format(player_uuid, self.uuid))
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
        fn = action_map.get(message['action'])
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

        The included fields are:
        - `claim_by`
        - `half_suit`
        - `turn`
        - `success`
        - `truth`
        - `score`
        - `move_timestamp`
        - `n_cards`

        The players should be shown the score at all times. The correct
        set of possessions should be shown to players until the next move is
        executed.
        """
        player_n = self.users[payload['key']].player_n
        player = self.game.players[player_n]
        claim = {}
        for c, p in payload['possessions'].items():
            claim[
                literature.deserialize(c[:-1], c[-1])
            ] = literature.Actor(int(p))
        success = self.game.commit_claim(player, claim)

        current_time = time.time()
        self.move_timestamp = current_time
        self.last_executed_move = current_time

        _random_card = list(payload['possessions'])[0]
        half_suit = literature.deserialize(_random_card[:-1],
                                           _random_card[-1]).half_suit()
        score = {
            t.name.lower():
                sum(self.game.claims[literature.HalfSuit(h, s)] == t
                    for h in literature.Half for s in literature.Suit)
            for t in literature.Team
        }
        self._send_all({
            'action': CLAIM,
            'payload': self._with_player_info({
                'claim_by': player_n,
                'half_suit': {
                    'half': half_suit.half.name.lower(),
                    'suit': half_suit.suit.name[0]
                },
                'turn': self.game.turn.unique_id,
                'success': success,
                'truth': {
                    c.serialize(): p.unique_id
                    for c, p in self.game.actual_possessions[half_suit].items()
                },
                'score': score
            })
        })
        self._send_hands()

    def _move(self, payload):
        """
        Execute a move for a player.
        """
        interrogator = int(self.users[payload['key']].player_n)
        respondent = int(payload['respondent'])
        card_str = payload['card']
        card = literature.deserialize(card_str[:-1], card_str[-1])
        self.game.commit_move(
            self.game.players[interrogator].asks(self.game.players[respondent])
                .to_give(card)
        )

        current_time = time.time()
        self.move_timestamp = current_time
        self.last_executed_move = current_time

        self._send_updated_game_state()

    def _switch_team(self, _):
        """
        Check if the current player's time is up. If so,
        switch the team and send the players the updated
        game state.
        """
        if self.current_players < self.n_players:
            # You cannot switch the turn if the game hasn't started
            return
        current_time = time.time()
        if abs(current_time - self.move_timestamp) >= self.time_limit:
            # If we're able to switch the turn, then do it.
            if self.game.switch_turn():
                self.move_timestamp = current_time
                self._send_updated_game_state()
            # Otherwise, the game is over.
            else:
                self._send_all({
                    'action': COMPLETE
                })

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
                i.unique_id: i.unclaimed_cards() for i in self.game.players
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
        for user in [u for u in self.users.values() if u.connected]:
            idx = user.player_n
            player = self.game.players[idx]
            gevent.spawn(self._send, user.socket, {
                'action': HAND,
                'payload': [c.serialize() for c in player.hand]
            })


def _uuid(db):
    u_id = uuid.uuid4().hex
    while u_id in db:
        u_id = uuid.uuid4().hex
    return u_id
