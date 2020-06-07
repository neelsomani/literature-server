import React, { Component } from 'react';
import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';

export default class Players extends Component {
    render() {
        const icons = [PlayerEvenIcon, PlayerOddIcon];
        let border = ((this.props.turn === this.props.playerN) && {
            border: 'solid 2px rgb(195, 195, 195)'
        }) || {};
        const playerInfo = { textAlign: 'center' };
        const cardsInfo = {
            textAlign: 'center',
            marginTop: '-10px'
        };
        let playerCls = 'Player';
        if (this.props.userPlayerN % 2 !== this.props.playerN % 2
            && this.props.turn == this.props.userPlayerN) {
            playerCls = playerCls + ' OtherTeamPlayer';
        }
        return <div
            className={playerCls}
            style={border}
            onClick={() => this.props.showModal(this.props.playerN)}>
            <img
                alt={'Player ' + this.props.playerN}
                src={icons[this.props.playerN % 2]}
                style={{ width: '100%' }} />
            <p style={playerInfo}>
                {this.props.playerName}
            </p>
            {(this.props.nCards !== undefined) &&
                <p style={cardsInfo}>{this.props.nCards} cards</p>}
        </div>
    }
}
