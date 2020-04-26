import React, { Component } from 'react';

import './CreateRoom.css';

class CreateRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            room: ''
        }
    }

    handleJoin() {
        window.location = '/game/' + this.state.room;
    }

    render() {
        return (
            <div className='CreateGameParent'>
                <div className='CreateGameBox'>
                    <h1>Literature</h1>
                    <div style={{ paddingBottom: '30px' }}>
                        <a className='CreateGameButton' href='/game'>Create New Game</a>
                    </div>
                    <div>
                        Join Room: <input placeholder='Room Code'
                            onChange={(e) => this.setState({ room: e.target.value })}
                            type='text' />
                        <button onClick={this.handleJoin.bind(this)}>Go</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateRoom;
