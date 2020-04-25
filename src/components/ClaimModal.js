import React, { Component } from 'react';
import CardGroup from './CardGroup';
import SetSelector from './SetSelector';
import { UNCLAIMED, SET_INDICATORS } from './Constants';

export default class ClaimModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSets: true,
        };
        this.correct = {};
        this.props.hand.forEach((c) => {
            this.correct[c] = this.props.playerN;
        });
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
                    cards={SET_INDICATORS.filter((s) => this.props.claims[s] == UNCLAIMED)} />}
                {!this.state.showSets && <SetSelector
                    team={this.props.playerN % 2}
                    nPlayers={this.props.nPlayers}
                    correct={this.correct}
                    makeClaim={this.props.makeClaim}
                    set={this.state.set} />}
            </div>
        </div>
    }
}
