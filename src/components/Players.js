import React, { Component } from 'react';
import Player from './Player';

export default class Players extends Component {
    render() {
        return <div className='Players'>
            {[
                ...Array(this.props.nPlayers).keys()
            ].filter((p) => p !== this.props.playerN)
                .map((p) => <Player
                    key={'player_' + p}
                    showModal={this.props.showModal}
                    turn={this.props.turn}
                    playerN={p}
                    playerName={(this.props.playerNames || {})[p.toString()]}
                    nCards={(this.props.nCards || {})[p]} />)}
        </div>;
    }
}
