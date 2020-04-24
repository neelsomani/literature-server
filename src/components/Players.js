import React, { Component } from 'react';
import Player from './Player';

export default class Players extends Component {
    render() {
        return <div class='Players'>
            {[
                ...Array(this.props.nPlayers).keys()
            ].map((p) => {
                if (p != this.props.playerN) {
                    return <Player
                        turn={this.props.turn}
                        playerN={p}
                        nCards={(this.props.nCards || {})[p]} />
                }
            })}
        </div>;
    }
}
