import React, { Component } from 'react';
import CardGroup from './CardGroup';
import SetSelector from './SetSelector';
import { NEITHER, SET_INDICATORS } from './Constants';

export default class ClaimModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSets: true,
        };
    }

    selectClaim(card) {
        this.setState({
            showSets: false,
            set: card
        });
    }

    render() {
        return <div className='ClaimCover'>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 5
            }} onClick={this.props.hideModal}></div>
            <div className='CardSelector' style={{ zIndex: 10 }}>
                {this.state.showSets && <CardGroup
                    clickCard={this.selectClaim.bind(this)}
                    suitClass='hhand-compact active-hand'
                    cards={SET_INDICATORS.filter((s) => this.props.claims[s] == NEITHER)} />}
                {!this.state.showSets && <SetSelector
                    playerN={this.props.playerN}
                    nPlayers={this.props.nPlayers}
                    hand={this.props.hand}
                    makeClaim={this.props.makeClaim}
                    set={this.state.set} />}
            </div>
        </div>
    }
}
