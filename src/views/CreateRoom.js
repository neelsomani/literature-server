import React, { Component } from 'react';

import './CreateRoom.css';

class CreateRoom extends Component {
    constructor(props) {
        super(props);
    }

    handleJoin(event) {
        event.preventDefault();
        window.location = '/game/' + this.roomCode.value + '?' +
            window.jQuery.param(
                { 'username': this.username.value }
            );
    }

    render() {
        return (
            <div className='CreateGameParent'>
                <div className='CreateGameBox'>
                    <h1>Literature</h1>
                    <form style={{ display: 'inline' }} action='/game' method='get'>
                        <div style={{ paddingBottom: '30px' }}>
                            Username: <input
                                maxLength={20}
                                placeholder='Max. 20 characters'
                                name='username'
                                type='text'
                                id='username'
                                ref={(input) => this.username = input} />
                        </div>
                        <div style={{ paddingBottom: '30px' }}>
                            <div>
                                New Game:{' '}
                                <select id='n_players' name='n_players'>
                                    <option value="4">4 Players</option>
                                    <option value="6">6 Players</option>
                                    <option value="8">8 Players</option>
                                </select>
                            </div>
                            <div>
                                Time Limit:{' '}
                                <select id='time_limit' name='time_limit'>
                                    <option value="60">60 seconds</option>
                                    <option value="120">120 seconds</option>
                                    <option value="180">180 seconds</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <button>Create</button>
                        </div>
                    </form>
                    Join Room:{' '}
                    <form
                        action='/'
                        method='get'
                        style={{ display: 'inline' }}
                        onSubmit={this.handleJoin.bind(this)}>
                        <input placeholder='Room Code'
                            ref={(input) => this.roomCode = input}
                            type='text' />
                        <button>Go</button>
                    </form>
                </div>
                <div className='Footer'>
                    Bring your own chat //{' '}
                    <a
                        style={{ color: '#10104a' }}
                        href="https://github.com/neelsomani/literature-server">GitHub Repo</a>
                    {' '}// MIT License
                </div>
            </div>
        );
    }
}

export default CreateRoom;
