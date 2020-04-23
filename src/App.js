import React, { Component } from 'react';
import VerticalCards from './components/VerticalCards';

class App extends Component {
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
        if (data.payload.success) {
          this.setState({
            uuid: data.payload.uuid
          })
        } else {
          console.log('All seats are full in the room');
        }
        break;
      case 'hand':
        this.setState({
          hand: data.payload
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
      <VerticalCards cards={this.state.hand} />
    );
  }
}

export default App;
