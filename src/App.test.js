import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

class MockReconnectingWebSocket {
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  window.ReconnectingWebSocket = MockReconnectingWebSocket;
  window.cards = {}
  ReactDOM.render(<App />, div);
});
