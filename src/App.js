import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  handleMessage(message) {
    let data = JSON.parse(message.data);
    console.log('Received: ' + JSON.stringify(data));
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
      ws_scheme + location.host + "/receive"
    );
    receiver.onmessage = this.handleMessage;
    receiver.onclose = function() {
      this.receiver = new WebSocket(receiver.url);
    };
    let sender = new window.ReconnectingWebSocket(
      ws_scheme + location.host + "/submit"
    );
    sender.onclose = function() {
      this.sender = new WebSocket(sender.url);
    };
    this.setState({
      'sender': sender
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
