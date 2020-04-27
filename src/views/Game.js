import React, { Component } from 'react';
import Players from '../components/Players';
import MoveDisplay from '../components/MoveDisplay';
import ClaimDisplay from '../components/ClaimDisplay';
import Timer from '../components/Timer';
import CardGroup from '../components/CardGroup';
import MakeMoveModal from '../components/MakeMoveModal';
import ClaimModal from '../components/ClaimModal';
import CorrectClaimModal from '../components/CorrectClaimModal';
import ScoreDisplay from '../components/ScoreDisplay';
import {
  SET_INDICATORS,
  CLAIMED,
  UNCLAIMED,
  SET_NAME_MAP,
  PLAYER_UUID,
  PLAYER_NAME
} from '../components/Constants';
import './Game.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: '',
      gameUuid: '',
      hand: [],
      nPlayers: 0,
      showMakeMoveModal: false,
      showClaimModal: false,
      showFullClaim: false,
      claims: this.allUnclaimed(),
      lastClaim: {},
      score: {
        even: 0,
        odd: 0,
        discard: 0
      },
      playerNames: this.defaultNames()
    };
    const audioUrl = process.env.PUBLIC_URL + '/bell.mp3';
    this.bell = new Audio(audioUrl);
  }

  defaultNames() {
    const playerNames = {};
    [...Array(8).keys()].forEach((p) => playerNames[p] = 'Player ' + p);
    return playerNames;
  }

  allUnclaimed() {
    const claims = {};
    SET_INDICATORS.forEach((s) => claims[s] = UNCLAIMED);
    return claims;
  }

  startGame() {
    this.sendMessage({
      action: 'start_game',
      game_uuid: this.state.gameUuid,
      payload: {
        key: this.state.uuid
      }
    })
  }

  makeClaim(possessions) {
    this.hideClaimModal();
    this.sendMessage({
      action: 'claim',
      game_uuid: this.state.gameUuid,
      payload: {
        key: this.state.uuid,
        possessions
      }
    })
  }

  playCard(card) {
    // Make sure the user is looking at the make move modal.
    if (this.state.showMakeMoveModal && card) {
      this.makeMove(card, this.state.toBeRespondent);
    }
  }

  hideClaimModal() {
    this.setState({
      showClaimModal: false
    });
  }

  hideMakeMoveModal() {
    this.setState({
      showMakeMoveModal: false,
      toBeRespondent: undefined
    });
  }

  showMakeMoveModal(toBeRespondent) {
    if (this.state.turn !== this.state.playerN) return;
    if (this.state.playerN % 2 === toBeRespondent % 2) return;
    this.setState({
      showMakeMoveModal: true,
      toBeRespondent
    });
  }

  makeMove(card, toBeRespondent) {
    this.sendMessage({
      action: 'move',
      game_uuid: this.state.gameUuid,
      payload: {
        key: this.state.uuid,
        respondent: toBeRespondent,
        card
      }
    })
    this.setState({
      showMakeMoveModal: false
    });
  }

  register(payload) {
    const {
      player_uuid,
      player_n,
      n_players,
      time_limit,
      game_uuid,
      player_names
    } = payload;
    localStorage.setItem(PLAYER_UUID, player_uuid);
    this.setState({
      uuid: player_uuid,
      playerN: player_n,
      nPlayers: n_players,
      timeLimit: time_limit,
      gameUuid: game_uuid,
      claims: this.allUnclaimed(),
      lastClaim: {},
      score: {
        even: 0,
        odd: 0,
        discard: 0
      },
      success: undefined,
      card: undefined,
      respondent: undefined,
      interrogator: undefined,
      moveTimestamp: undefined,
      playerNames: { ...this.defaultNames(), ...player_names }
    });
    window.history.pushState({ gameUuid: game_uuid },
      'Literature',
      '/game/' + game_uuid);
    if (player_n === -1) {
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
      interrogator,
      score
    } = payload;
    if (turn === this.state.playerN && turn !== this.state.turn)
      this.bell.play();
    this.setState({
      nCards: n_cards,
      moveTimestamp: move_timestamp,
      turn,
      success,
      card,
      respondent,
      interrogator,
      score: {
        ...this.state.score,
        ...score
      }
    })
    if (turn !== this.state.playerN) this.hideMakeMoveModal();
  }

  claim(payload) {
    const {
      move_timestamp,
      n_cards,
      claim_by,
      half_suit,
      turn,
      success,
      truth,
      score
    } = payload;
    if (turn === this.state.playerN && turn !== this.state.turn)
      this.bell.play();
    const claims = { ...this.state.claims };
    claims[SET_NAME_MAP[half_suit.half] + half_suit.suit] = CLAIMED;
    this.setState({
      nCards: n_cards,
      moveTimestamp: move_timestamp,
      turn,
      score: {
        ...this.state.score,
        ...score
      },
      claims,
      lastClaim: {
        claimBy: claim_by,
        success,
        truth,
        halfSuit: half_suit
      }
    })
    if (turn !== this.state.playerN) this.hideMakeMoveModal();
  }

  playerNames(payload) {
    this.setState({ playerNames: payload.names });
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
      case 'claim':
        this.claim(data.payload)
        break;
      case 'player_names':
        this.playerNames(data.payload)
        break;
      default:
        throw new Error('Unhandled action: ' + data.action);
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
    const queryParams = new URLSearchParams(window.location.search);
    const pathParams = window.location.pathname.split('/');
    const player_uuid = localStorage.getItem(PLAYER_UUID);
    const storedUsername = localStorage.getItem(PLAYER_NAME);
    const username = queryParams.get('username') || storedUsername
    localStorage.setItem(PLAYER_NAME, username || '');
    const sendParams = window.jQuery.param({
      n_players: queryParams.get('n_players'),
      username,
      game_uuid: pathParams[pathParams.length - 1],
      player_uuid
    });
    const receiver = new window.ReconnectingWebSocket(
      ws_scheme + window.location.host + "/receive?" + sendParams
    );
    receiver.onmessage = this.handleMessage.bind(this);
    const sender = new window.ReconnectingWebSocket(
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
          playerNames={this.state.playerNames}
          nCards={this.state.nCards}
          turn={this.state.turn}
          showModal={this.showMakeMoveModal.bind(this)} />
        <MoveDisplay
          success={this.state.success}
          card={this.state.card}
          playerNames={this.state.playerNames}
          interrogator={this.state.interrogator}
          respondent={this.state.respondent} />
        <ClaimDisplay
          success={this.state.lastClaim.success}
          claimBy={this.state.lastClaim.claimBy}
          playerNames={this.state.playerNames}
          halfSuit={this.state.lastClaim.halfSuit}
          showFullClaim={() => this.setState({ showFullClaim: true })}
        />
        <Timer
          moveTimestamp={this.state.moveTimestamp}
          timeLimit={this.state.timeLimit}
          switchTeam={() => this.sendMessage({
            action: 'switch_team',
            game_uuid: this.state.gameUuid
          })}
          turn={this.state.turn}
          gameUuid={this.state.gameUuid}
          playerNames={this.state.playerNames}
          playerN={this.state.playerN} />
        <CardGroup
          handClass='Player-hand'
          suitClass='vhand-compact'
          cards={this.state.hand}
          claims={this.state.claims} />
        {this.state.showMakeMoveModal && <MakeMoveModal
          hand={this.state.hand}
          hideModal={this.hideMakeMoveModal.bind(this)}
          playCard={this.playCard.bind(this)}
          claims={this.state.claims} />}
        {this.state.showClaimModal && <ClaimModal
          playerN={this.state.playerN}
          nPlayers={this.state.nPlayers}
          playerNames={this.state.playerNames}
          hand={this.state.hand}
          claims={this.state.claims}
          hideModal={this.hideClaimModal.bind(this)}
          makeClaim={this.makeClaim.bind(this)} />}
        {this.state.showFullClaim &&
          <CorrectClaimModal
            nPlayers={this.state.nPlayers}
            correct={this.state.lastClaim.truth}
            playerNames={this.state.playerNames}
            set={SET_NAME_MAP[(this.state.lastClaim.halfSuit || {}).half] +
              (this.state.lastClaim.halfSuit || {}).suit}
            hideModal={() => { this.setState({ showFullClaim: false }) }}
          />}

        <ScoreDisplay score={this.state.score} />
        {this.state.playerN !== -1 && this.state.moveTimestamp && <button
          className='ClaimButton'
          onClick={() => this.setState({ showClaimModal: true })}>Make Claim</button>}
        {!this.state.moveTimestamp && <button
          className='BotsButton'
          onClick={this.startGame.bind(this)}>Fill With Bots</button>}
      </div>
    );
  }
}

export default Game;
