import React, { Component } from 'react';
import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';

export default class Players extends Component {
    render() {
        const icons = [PlayerEvenIcon, PlayerOddIcon];
        let border = (this.props.turn == this.props.playerN) && {
            border: 'solid 3px white'
        } || {};
        return <div
            className='Player'
            style={border}
            onClick={() => this.props.showModal(this.props.playerN)}>
            <img
                src={icons[this.props.playerN % 2]}
                style={{ width: '100%' }} />
            <p style={{ textAlign: 'center', color: '#c0c0c0' }}>
                Player {this.props.playerN} {
                    this.props.nCards && <p>{this.props.nCards} cards</p>
                }
            </p>
        </div>
    }
}
