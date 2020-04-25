import React, { Component } from 'react';
import Card from './Card';
import { CARD_TO_NUMBER } from './Constants';

export default class CardGroup extends Component {
    sortCard(a, b) {
        if (CARD_TO_NUMBER[a] > CARD_TO_NUMBER[b]) return 1;
        else if (CARD_TO_NUMBER[a] == CARD_TO_NUMBER[b]) return 0;
        return -1;
    }

    render() {
        const suited = {
            'C': [],
            'D': [],
            'H': [],
            'S': []
        };
        this.props.cards.forEach((c) => {
            const suit = c[c.length - 1];
            suited[suit].push(c);
        });
        for (let s in suited) {
            suited[s].sort(this.sortCard);
        }
        let suitClass = "hand"
        if (this.props.suitClass) {
            suitClass += ' ' + this.props.suitClass;
        }
        return (
            <div className={this.props.handClass}>
                <div className={suitClass}>
                    {suited['C'].map((c) => <Card
                        key={'card-' + c}
                        clickCard={this.props.clickCard}
                        card={c} />)}
                </div>
                <div className={suitClass}>
                    {suited['D'].map((c) => <Card
                        key={'card-' + c}
                        clickCard={this.props.clickCard}
                        card={c} />)}
                </div>
                <div className={suitClass}>
                    {suited['H'].map((c) => <Card
                        key={'card-' + c}
                        clickCard={this.props.clickCard}
                        card={c} />)}
                </div>
                <div className={suitClass}>
                    {suited['S'].map((c) => <Card
                        key={'card-' + c}
                        clickCard={this.props.clickCard}
                        card={c} />)}
                </div>
            </div>
        )
    }
}
