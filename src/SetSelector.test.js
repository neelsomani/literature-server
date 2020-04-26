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
  const preselected = {
    '8D': 0,
    '9D': 1,
    'JD': 1,
    'QD': 3,
    'KD': 3
  }

  const makeClaim = (possessions) => {
    Object.keys(preselected).forEach((k) => {
      expect(possessions[k]).toBe(preselected[k]);
    })
    expect(possessions['10D']).toBe(0);
  }

  ReactDOM.render(
    <SetSelector
      set='KD'
      nPlayers={4}
      correct={preselected}
      makeClaim={makeClaim} />, container);

  const radios = container.getElementsByClassName('claim-10D');
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].value == 0) radios[i].click();
  }

  container.getElementsByClassName('MakeClaimButton')[0].click();
})
