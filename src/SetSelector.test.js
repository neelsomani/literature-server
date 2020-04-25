import React from 'react';
import ReactDOM from 'react-dom';
import SetSelector from './components/SetSelector';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container = null;
});

it('renders without crashing', () => {
  ReactDOM.render(<SetSelector set='KD' />, container);
})

it('selects the correct cards by default', () => {
  const correct = {
    '8D': 0,
    '9D': 1,
    '10D': 0,
    'JD': 1,
    'QD': 3,
    'KD': 3
  }

  const makeClaim = (possessions) => {
    Object.keys(possessions).forEach((k) => {
      expect(possessions[k]).toBe(correct[k]);
    })
  }

  ReactDOM.render(
    <SetSelector
      set='KD'
      nPlayers={4}
      correct={correct}
      makeClaim={makeClaim} />, container);

  container.getElementsByClassName('MakeClaimButton')[0].click();
})
