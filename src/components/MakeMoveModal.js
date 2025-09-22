import React, { Component } from 'react';
import CardGroup from './CardGroup';
import { SETS, SUITS } from './Constants';

export default class MakeMoveModal extends Component {
    constructor(props) {
        super(props);
        const hand = new Set(props.hand);
        this.state = {
            cards: []
        }
        Object.keys(SETS).forEach((k) => {
            const set = SETS[k];
            SUITS.forEach((s) => {
                let canAskHalf = false;
                set.forEach((r) => {
                    if (hand.has(r + s)) canAskHalf = true;
                });
                if (!canAskHalf) return;
                set.forEach((r) => {
                    if (!hand.has(r + s)) {
                        this.state.cards.push((r + s))
                    }
                });
            });
        });
    }

    render() {
        return <div className='MakeMoveCover'>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 5
            }} onClick={this.props.hideModal}></div>
            <div className='CardSelector' style={{ zIndex: 10 }}>
                <CardGroup
                    handClass='CardSelector-hand'
                    clickCard={this.props.playCard}
                    suitClass='vhand-compact active-hand'
                    cards={this.state.cards}
                    claims={this.props.claims} />
            </div>
        </div>
    }
}
