import React, { Component } from 'react';
import PlayerIcon from './player.png';

export default class Players extends Component {
    render() {
        let border = (this.props.turn == this.props.playerN) && {
            border: 'solid 3px white'
        } || {};
        return <div
            class='Player'
            style={border}
            onClick={() => this.props.showModal(this.props.playerN)}>
            <img src={PlayerIcon} style={{ width: '100%' }} />
            <p style={{ textAlign: 'center', color: '#c0c0c0' }}>
                Player {this.props.playerN} {
                    this.props.nCards && <p>{this.props.nCards} cards</p>
                }
            </p>
        </div>
    }
}
