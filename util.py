""" Scheduling function """
from threading import Event, Thread


def schedule(interval, func, repeat=False):
    stopped = Event()

    def loop():
        while not stopped.wait(interval):
            func()
            if not repeat:
                stopped.set()
    Thread(target=loop).start()
    return stopped.set


class BotClient:
    """ A class to represent a bot user. """
    def send(self, _):
        raise AssertionError('closed')
