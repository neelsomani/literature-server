import json
import os

from flask import Flask
from flask_sockets import Sockets
import gevent

from backend import LiteratureAPI

app = Flask(__name__, static_folder='build/', static_url_path='/')
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)
api = LiteratureAPI()


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)


@sockets.route('/submit')
def submit(ws):
    """ Receives incoming chat messages, sends to all clients. """
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
    """ Register the WebSocket. """
    api.register(ws)
    while not ws.closed:
        gevent.sleep(0.1)
