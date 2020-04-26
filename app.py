import json
import os
import uuid

from flask import Flask
from flask_sockets import Sockets
import gevent

from backend import LiteratureAPI

app = Flask(__name__, static_folder='build/', static_url_path='/')
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)

api = LiteratureAPI(u_id=uuid.uuid4().hex,
                    logger=app.logger,
                    n_players=4,
                    time_limit=30)


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


@sockets.route('/submit')
def submit(ws):
    """ Receive incoming messages from the client. """
    while not ws.closed:
        gevent.sleep(0.1)
        msg = ws.receive()
        if not msg:
            continue

        try:
            user_msg = json.loads(msg)
        except json.decoder.JSONDecodeError as _:
            app.logger.exception('Exception in parsing JSON message: {}'
                                 .format(msg))
            continue

        app.logger.info('Handling message: {}'.format(msg))
        api.handle_message(user_msg)


@sockets.route('/receive')
def receive(ws):
    """ Register the WebSocket to send messages to the client. """
    # TODO(@neel): Listen for initial payload from WebSocket,
    # which should contain either nothing or a game ID.
    # Initialize new game if nothing. Reconnect as player if UUID included.
    api.register(ws)
    while not ws.closed:
        gevent.sleep(0.1)
