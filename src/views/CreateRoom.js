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
                <div className='Header'><h1 className='LiteratureHeader'>Literature</h1></div>
                <div className='CreateGameBox'>
                    <div className='CreateGameForm'>
                        <a href='/rules.txt'>Rules</a>
                        <form action='/game' method='get'>
                            <div className="form-group">
                                <label for="username">Username</label>
                                <div><input
                                    className="form-control"
                                    maxLength={20}
                                    placeholder='Max. 20 characters'
                                    name='username'
                                    type='text'
                                    id='username'
                                    ref={(input) => this.username = input} />
                                </div>
                            </div>
                            <div className='Form-Header'>New Game</div>
                            <div className="form-group">
                                <div>
                                    <select
                                        id='n_players'
                                        className='form-control'
                                        name='n_players'>
                                        <option value="4">4 Players</option>
                                        <option value="6">6 Players</option>
                                        <option value="8">8 Players</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id='time_limit'
                                        className='form-control'
                                        name='time_limit'>
                                        <option value="60">60 seconds</option>
                                        <option value="120">120 seconds</option>
                                        <option value="180">180 seconds</option>
                                        <option value="None">None</option>
                                    </select>
                                </div>
                                <button className="btn btn-secondary">Create</button>
                            </div>
                        </form>
                        <div className='Form-Header'>Join Room</div>
                        <form
                            action='/'
                            method='get'
                            style={{ display: 'inline' }}
                            onSubmit={this.handleJoin.bind(this)}>
                            <div><input placeholder='Room Code'
                                id="room_code"
                                className="form-control"
                                ref={(input) => this.roomCode = input}
                                type='text' /></div>
                            <button className="btn btn-secondary">Go</button>
                        </form>
                    </div>
                </div>
                <div className='Footer'>
                    Bring your own chat //{' '}
                    <a href="https://github.com/neelsomani/literature-server">GitHub Repo</a>
                    {' '}// MIT License
                </div>
            </div>
        );
    }
}

export default CreateRoom;
