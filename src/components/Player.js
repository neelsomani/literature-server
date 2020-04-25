import React, { Component } from 'react';
import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';

export default class Players extends Component {
    render() {
        const icons = [PlayerEvenIcon, PlayerOddIcon];
        let border = (this.props.turn == this.props.playerN) && {
            border: 'solid 3px white'
        } || {};
        const playerInfo = { textAlign: 'center', color: '#c0c0c0' };
        const cardsInfo = {
            textAlign: 'center',
            color: '#c0c0c0',
            marginTop: '-10px'
        };
        return <div
            className='Player'
            style={border}
            onClick={() => this.props.showModal(this.props.playerN)}>
            <img
                src={icons[this.props.playerN % 2]}
                style={{ width: '100%' }} />
            <p style={playerInfo}>
                Player {this.props.playerN}
            </p>
            {this.props.nCards &&
                <p style={cardsInfo}>{this.props.nCards} cards</p>}
        </div >
    }
}
