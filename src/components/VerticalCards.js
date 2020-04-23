import React, { Component } from 'react';
import Card from './Card';

export default class VerticalCards extends Component {
    render() {
        const suited = {
            'C': [],
            'D': [],
            'H': [],
            'S': []
        }
        console.log(this.props)
        this.props.cards.forEach((c) => {
            const suit = c[c.length - 1];
            suited[suit].push(c);
        });
        return (
            <div>
                <div class="hand vhand-compact active-hand">
                    {suited['C'].map((c) => <Card card={c} />)}
                </div>
                <div class="hand vhand-compact active-hand">
                    {suited['D'].map((c) => <Card card={c} />)}
                </div>
                <div class="hand vhand-compact active-hand">
                    {suited['H'].map((c) => <Card card={c} />)}
                </div>
                <div class="hand vhand-compact active-hand">
                    {suited['S'].map((c) => <Card card={c} />)}
                </div>
            </div>
        )
    }
}
