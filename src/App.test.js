import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import App from './App';

class MockSocketWrapper {
  socketClass() {
    const parent = this;
    class MockReconnectingWebSocket {
      constructor(props) {
        if (props.includes('receive')) {
          parent.socket = this;
        }
      }
    }
    return MockReconnectingWebSocket;
  }
}

function serialize(payload) {
  return {
    'data': JSON.stringify(payload)
  };
}

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('renders without crashing', () => {
  const socketWrapper = new MockSocketWrapper();
  window.ReconnectingWebSocket = socketWrapper.socketClass();
  window.cards = {}
  ReactDOM.render(<App />, container);
  socketWrapper.socket.onmessage(serialize(
    {
      'action': 'register',
      'payload': {
        'uuid': '0',
        'player_n': 0,
        'n_players': 4,
        'time_limit': 30
      }
    }));
});
