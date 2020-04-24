import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const PLAYER_KEY = '123';

class MockSocketWrapper {
  socketClass() {
    const parent = this;
    class MockReconnectingWebSocket {
      constructor(props) {
        if (props.includes('receive')) {
          parent.socket = this;
        }
      }

      send(msg) {
        parent.msg = msg;
      }
    }
    return MockReconnectingWebSocket;
  }
}

function serialize(payload) {
  return {
    data: JSON.stringify(payload)
  };
}

function initSixPlayerGame() {
  socketWrapper.socket.onmessage(serialize(
    {
      action: 'register',
      payload: {
        success: true,
        uuid: PLAYER_KEY,
        player_n: 0,
        n_players: 6,
        time_limit: 30
      }
    }));
}

function _lastMove() {
  return {
    action: 'last_move',
    payload: {
      nCards: {
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1
      },
      moveTimestamp: 0,
      turn: 0,
      success: false,
      card: 'KC',
      respondent: 0,
      interrogator: 1
    }
  }
}

let socketWrapper;
let container;

beforeEach(() => {
  socketWrapper = new MockSocketWrapper();
  window.ReconnectingWebSocket = socketWrapper.socketClass();
  window.cards = {}
  container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(<App />, container);
});

afterEach(() => {
  socketWrapper = null;
  container = null;
});

it('handles visitor correctly', () => {
  socketWrapper.socket.onmessage(serialize(
    {
      action: 'register',
      payload: {
        success: false,
        player_n: -1,
        n_players: 4,
        time_limit: 30
      }
    }));
  expect(container.getElementsByClassName('Player')).toHaveLength(4);
});

it('handles player correctly', () => {
  initSixPlayerGame();
  expect(container.getElementsByClassName('Player')).toHaveLength(5);
  socketWrapper.socket.onmessage(serialize(
    {
      action: 'hand',
      payload: ['AC', '2C']
    }));
  expect(container.getElementsByClassName('card')).toHaveLength(2);
  socketWrapper.socket.onmessage(serialize(_lastMove()));
  expect(container.getElementsByClassName('MoveDisplay')[0]).toHaveProperty(
    'innerHTML',
    'Failure: Player 1 KC from Player 0'
  );
});

it('handles making moves correctly', () => {
  initSixPlayerGame();
  socketWrapper.socket.onmessage(serialize(
    {
      action: 'hand',
      payload: ['AC']
    }));
  expect(container.getElementsByClassName('MakeMoveCover')).toHaveLength(0);
  const players = container.getElementsByClassName('Player');
  // The modal should not show unless it is the player's turn
  for (let i = 0; i < players.length; i++) {
    players[i].click();
    expect(container.getElementsByClassName('MakeMoveCover')).toHaveLength(0);
  }
  socketWrapper.socket.onmessage(serialize(_lastMove()));
  // Test showing and hiding the make move modal works
  players[0].click();
  expect(container.getElementsByClassName('MakeMoveCover')).toHaveLength(1);
  container.getElementsByClassName('MakeMoveCover')[0].children[0].click();
  expect(container.getElementsByClassName('MakeMoveCover')).toHaveLength(0);
  // Move serialization
  players[0].click();
  container.getElementsByClassName('MakeMoveCover')[0]
    .getElementsByClassName('card')[0].click();
  const move = JSON.parse(socketWrapper.msg);
  expect(move.action).toBe('move');
  expect(move.payload.key).toBe(PLAYER_KEY);
  expect(move.payload.respondent).toBe(1);
})
