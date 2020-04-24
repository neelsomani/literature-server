import React, { Component } from 'react';
import Card from './Card';

export default class VerticalCards extends Component {
    sortCard(a, b) {
        const mapping = {
            'A': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            'J': 11,
            'Q': 12,
            'K': 13
        }
        if (mapping[a] > mapping[b]) return 1;
        else if (mapping[a] == mapping[b]) return 0;
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
        let suitClass = "hand vhand-compact"
        if (this.props.suitClass) {
            suitClass += ' ' + this.props.suitClass;
        }
        return (
            <div class={this.props.handClass}>
                <div class={suitClass}>
                    {suited['C'].map((c) => <Card
                        playCard={this.props.playCard}
                        card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['D'].map((c) => <Card
                        playCard={this.props.playCard}
                        card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['H'].map((c) => <Card
                        playCard={this.props.playCard}
                        card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['S'].map((c) => <Card
                        playCard={this.props.playCard}
                        card={c} />)}
                </div>
            </div>
        )
    }
}
