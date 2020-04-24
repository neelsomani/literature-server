import React, { Component } from 'react';
import Players from './components/Players';
import MoveDisplay from './components/MoveDisplay';
import Timer from './components/Timer';
import VerticalCards from './components/VerticalCards';
import './App.css';

class App extends Component {
  NOT_STARTED = 'not_started';
  RUNNING = 'running';

  constructor(props) {
    super(props)
    this.state = {
      uuid: '',
      hand: []
    }
  }

  handleMessage(message) {
    let data = JSON.parse(message.data);
    console.log('Received: ' + JSON.stringify(data));
    switch (data.action) {
      case 'register':
        const { uuid, player_n, n_players, time_limit } = data.payload;
        this.setState({
          uuid,
          playerN: player_n,
          nPlayers: n_players,
          timeLimit: time_limit,
          gameStatus: this.NOT_STARTED
        });
        if (!data.payload.success) {
          console.log('All seats are full in the room');
        }
        break;
      case 'hand':
        this.setState({
          hand: data.payload,
          gameStatus: this.RUNNING
        });
        break;
      case 'last_move':
        const {
          n_cards,
          move_timestamp,
          turn,
          success,
          card,
          respondent,
          interrogator
        } = data.payload;
        this.setState({
          nCards: n_cards,
          moveTimestamp: move_timestamp,
          turn,
          success,
          card,
          respondent,
          interrogator
        })
        break;
      default:
        console.log('Unhandled action: ' + data.action);
    }
  }

  sendMessage(message) {
    this.sender.send(JSON.stringify({ message }));
  }

  componentDidMount() {
    let ws_scheme;
    if (window.location.protocol === "https:") {
      ws_scheme = "wss://";
    } else {
      ws_scheme = "ws://"
    };
    let receiver = new window.ReconnectingWebSocket(
      ws_scheme + window.location.host + "/receive"
    );
    receiver.onmessage = this.handleMessage.bind(this);
    receiver.onclose = function () {
      this.receiver = new WebSocket(receiver.url);
    };
    let sender = new window.ReconnectingWebSocket(
      ws_scheme + window.location.host + "/submit"
    );
    sender.onclose = function () {
      this.sender = new WebSocket(sender.url);
    };
    this.setState({
      'sender': sender
    })
  }

  render() {
    return (
      <div>
        <Players
          nPlayers={this.state.nPlayers}
          playerN={this.state.playerN}
          nCards={this.state.nCards}
          turn={this.state.turn} />
        <MoveDisplay
          success={this.state.success}
          card={this.state.card}
          interrogator={this.state.interrogator}
          respondent={this.state.respondent} />
        <Timer moveTimestamp={this.state.moveTimestamp} />
        <VerticalCards handClass='Player-hand' cards={this.state.hand} />
      </div>
    );
  }
}

export default App;
