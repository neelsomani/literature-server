import React, { Component } from 'react';
import Card from './Card';

export default class VerticalCards extends Component {
    componentDidUpdate() {
        window.cards.playCard = this.playCard.bind(this);
    }

    playCard(card) {
        if (this.props.respondent) {
            console.log(card.context.getAttribute('aria-card-name'));
            console.log(this.props.respondent);
        }
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
            suited[s].sort();
        }
        let suitClass = "hand vhand-compact"
        if (this.props.suitClass) {
            suitClass += ' ' + this.props.suitClass;
        }
        return (
            <div class={this.props.handClass}>
                <div class={suitClass}>
                    {suited['C'].map((c) => <Card card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['D'].map((c) => <Card card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['H'].map((c) => <Card card={c} />)}
                </div>
                <div class={suitClass}>
                    {suited['S'].map((c) => <Card card={c} />)}
                </div>
            </div>
        )
    }
}
