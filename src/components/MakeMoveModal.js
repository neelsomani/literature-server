import React, { Component } from 'react';
import VerticalCards from './VerticalCards';

export default class MakeMoveModal extends Component {
    sets = [
        ['A', '2', '3', '4', '5', '6'],
        ['8', '9', '10', 'J', 'Q', 'K']
    ]
    suits = ['C', 'D', 'H', 'S']

    constructor(props) {
        super(props);
        const hand = new Set(props.hand);
        this.state = {
            cards: []
        }
        this.sets.forEach((set) => {
            this.suits.forEach((s) => {
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
        return <div class='MakeMoveCover'>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 5
            }} onClick={this.props.hideModal}></div>
            <div class='CardSelector' style={{ zIndex: 10 }}>
                <VerticalCards
                    playCard={this.props.playCard}
                    suitClass='active-hand'
                    cards={this.state.cards} />
            </div>
        </div>
    }
}
