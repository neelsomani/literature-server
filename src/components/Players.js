import React, { Component } from 'react';
import Player from './Player';

export default class Players extends Component {
    render() {
        return <div className='Players'>
            {[
                ...Array(this.props.nPlayers).keys()
            ].map((p) => {
                if (p != this.props.playerN) {
                    return <Player
                        showModal={this.props.showModal}
                        turn={this.props.turn}
                        playerN={p}
                        nCards={(this.props.nCards || {})[p]} />
                }
            })}
        </div>;
    }
}
