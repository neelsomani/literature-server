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
      showMakeMoveModal: false
    };
  }

  playCard(card) {
    // Make sure the user is looking at the make move modal.
    if (this.state.showMakeMoveModal && card) {
      this.makeMove(card, this.state.toBeRespondent);
    }
  }

  hideMakeMoveModal() {
    this.setState({
      showMakeMoveModal: false,
      toBeRespondent: undefined
    });
  }

  showMakeMoveModal(toBeRespondent) {
    if (this.state.turn != this.state.playerN) return;
    if (this.state.playerN % 2 == toBeRespondent % 2) return;
    this.setState({
      showMakeMoveModal: true,
      toBeRespondent
    });
  }

  makeMove(card, toBeRespondent) {
    this.sendMessage({
      'action': 'move',
      'payload': {
        'key': this.state.uuid,
        'respondent': toBeRespondent,
        'card': card
      }
    })
    this.setState({
      showMakeMoveModal: false
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
    if (turn != this.state.playerN) this.hideMakeMoveModal();
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
        throw 'Unhandled action: ' + data.action;
    }
  }

  sendMessage(payload) {
    console.log('Sending: ' + JSON.stringify(payload))
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
    });
    window.cards.playCard = (c) => { };
  }

  render() {
    return (
      <div>
        <Players
          nPlayers={this.state.nPlayers}
          playerN={this.state.playerN}
          nCards={this.state.nCards}
          turn={this.state.turn}
          showModal={this.showMakeMoveModal.bind(this)} />
        <MoveDisplay
          success={this.state.success}
          card={this.state.card}
          interrogator={this.state.interrogator}
          respondent={this.state.respondent} />
        <Timer
          moveTimestamp={this.state.moveTimestamp}
          timeLimit={this.state.timeLimit}
          switchTeam={() => this.sendMessage({ 'action': 'switch_team' })}
          turn={this.state.turn}
          playerN={this.state.playerN} />
        <VerticalCards handClass='Player-hand' cards={this.state.hand} />
        {this.state.showMakeMoveModal && <MakeMoveModal
          hand={this.state.hand}
          hideModal={this.hideMakeMoveModal.bind(this)}
          playCard={this.playCard.bind(this)} />}
      </div>
    );
  }
}

export default App;
