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
                        New Game:{' '}
                        <form style={{ display: 'inline' }} action='/game' method='get'>
                            <select id='n_players' name='n_players'>
                                <option value="4">4 Players</option>
                                <option value="6">6 Players</option>
                                <option value="8">8 Players</option>
                            </select>
                            <button>Create</button>
                        </form>
                    </div>
                    Join Room: <input placeholder='Room Code'
                        onChange={(e) => this.setState({ room: e.target.value })}
                        type='text' />
                    <button onClick={this.handleJoin.bind(this)}>Go</button>
                </div>
            </div>
        );
    }
}

export default CreateRoom;
