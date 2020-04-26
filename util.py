""" Scheduling function """
from threading import Event, Thread


def schedule(interval, func, repeat):
    stopped = Event()

    def loop():
        while not stopped.wait(interval):
            func()
            if not repeat:
                break
    Thread(target=loop).start()
    return stopped.set
