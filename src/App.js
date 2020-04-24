import React, { Component } from 'react';
import Players from './components/Players';
import MoveDisplay from './components/MoveDisplay';
import Timer from './components/Timer';
import VerticalCards from './components/VerticalCards';
import MakeMoveModal from './components/MakeMoveModal';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: '',
      hand: [],
      nPlayers: 0,
      showMakeMoveModal: true,
    };
  }

  toggleMakeMoveModal() {
    this.setState({
      showMakeMoveModal: !this.state.showMakeMoveModal
    });
  }

  register(payload) {
    const { uuid, player_n, n_players, time_limit } = payload;
    this.setState({
      uuid,
      playerN: player_n,
      nPlayers: n_players,
      timeLimit: time_limit
    });
    if (!payload.success) {
      console.log('All seats are full in the room');
    }
  }

  lastMove(payload) {
    const {
      n_cards,
      move_timestamp,
      turn,
      success,
      card,
      respondent,
      interrogator
    } = payload;
    this.setState({
      nCards: n_cards,
      moveTimestamp: move_timestamp,
      turn,
      success,
      card,
      respondent,
      interrogator
    })
  }

  handleMessage(message) {
    let data = JSON.parse(message.data);
    console.log('Received: ' + JSON.stringify(data));
    switch (data.action) {
      case 'register':
        this.register(data.payload)
        break;
      case 'hand':
        this.setState({
          hand: data.payload
        });
        break;
      case 'last_move':
        this.lastMove(data.payload)
        break;
      default:
        console.log('Unhandled action: ' + data.action);
    }
  }

  sendMessage(payload) {
    this.state.sender.send(JSON.stringify(payload));
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
    let sender = new window.ReconnectingWebSocket(
      ws_scheme + window.location.host + "/submit"
    );
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
        <Timer
          moveTimestamp={this.state.moveTimestamp}
          timeLimit={this.state.timeLimit}
          switchTeam={() => this.sendMessage({ 'action': 'switch_team' })}
          playerN={this.state.playerN} />
        <VerticalCards handClass='Player-hand' cards={this.state.hand} />
        {this.state.showMakeMoveModal && <MakeMoveModal
          respondent={2}
          cards={this.state.hand}
          toggleModal={this.toggleMakeMoveModal.bind(this)} />}
      </div>
    );
  }
}

export default App;
