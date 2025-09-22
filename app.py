import json
import os

from flask import Flask, request
from flask_sock import Sock
from simple_websocket import ConnectionClosed
import gevent

from backend import RoomManager
import util

app = Flask(__name__, static_folder='build/', static_url_path='/')
app.debug = 'DEBUG' in os.environ

sock = Sock(app)
room_manager = RoomManager(app.logger)
util.schedule(RoomManager.DELETE_ROOMS_AFTER_MIN * 60,
              room_manager.delete_unused_rooms,
              repeat=True)


@app.route('/')
@app.route('/game')
@app.route('/game/')
def index():
    return app.send_static_file('index.html')


@app.route('/game/<_>')
def game(_):
    return index()


@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


@sock.route('/submit')
def submit(ws):
    """ Receive incoming messages from the client. """
    while ws.connected:
        try:
            msg = ws.receive()
        except ConnectionClosed:
            break
        if msg is None:
            continue

        try:
            user_msg = json.loads(msg)
        except json.decoder.JSONDecodeError:
            app.logger.exception('Exception in parsing JSON message: {}'
                                 .format(msg))
            continue

        app.logger.info('Handling message: %s', msg)
        room_manager.handle_message(user_msg)


@sock.route('/receive')
def receive(ws):
    """ Register the WebSocket to send messages to the client. """
    game_uuid, player_uuid, n_players, username, time_limit = (
        request.args.get('game_uuid'),
        request.args.get('player_uuid'),
        request.args.get('n_players'),
        request.args.get('username'),
        request.args.get('time_limit')
    )
    room_manager.join_game(client=ws,
                           player_uuid=player_uuid,
                           game_uuid=game_uuid,
                           n_players=n_players,
                           username=username,
                           time_limit=time_limit)
    try:
        while ws.connected:
            gevent.sleep(0.1)
    except ConnectionClosed:
        pass
