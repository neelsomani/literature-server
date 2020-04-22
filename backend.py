import gevent


class LiteratureAPI:
    """ Interface for registering and updating WebSocket clients. """

    def __init__(self):
        self.clients = list()

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
        pass
