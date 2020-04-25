import React, { Component } from 'react';
import { SETS } from './Constants';

export default class SetSelector extends Component {
    constructor(props) {
        super(props);
        this.rankIndicator = this.props.set[0];
        this.suitIndicator = this.props.set[1];
        const possessions = {};
        [...Array(this.props.nPlayers).keys()]
            .filter((p) => p % 2 == this.props.playerN % 2)
            .forEach((p) => {
                possessions[p] = {};
                SETS[this.rankIndicator].forEach(
                    (r) => possessions[p][r + this.suitIndicator] =
                        this.props.hand.includes(r + this.suitIndicator)
                        && (p == this.props.playerN));
            });
        const disabled = {};
        SETS[this.rankIndicator].forEach(
            (r) => disabled[r + this.suitIndicator] =
                this.props.hand.includes(r + this.suitIndicator));
        this.disabled = disabled;
        this.state = {
            possessions
        }
    }

    makeClaim() {
        const possessions = {};
        Object.keys(this.state.possessions).forEach((p) => {
            const cardDict = this.state.possessions[p];
            Object.keys(cardDict).forEach((c) => {
                if (cardDict[c]) {
                    possessions[c] = parseInt(p);
                }
            });
        });
        this.props.makeClaim(possessions);
    }

    handleOptionChange(card, player) {
        const possessions = {};
        // Replace the radio button values for the affected row
        Object.keys(this.state.possessions).forEach((p) => {
            const cardDict = this.state.possessions[p];
            possessions[p] = {};
            Object.keys(cardDict).forEach((c) => {
                if (c == card && p != player) {
                    possessions[p][c] = false;
                } else if (c == card && p == player) {
                    possessions[p][c] = true;
                } else {
                    possessions[p][c] = cardDict[c];
                }
            });
        });
        this.setState({
            possessions
        });
    }

    render() {
        const selectors = (<table>
            {SETS[this.rankIndicator].map((r) => (
                <tr>
                    <td>{r}{this.suitIndicator}:</td>
                    {[...Array(this.props.nPlayers).keys()]
                        .filter((p) => p % 2 == this.props.playerN % 2)
                        .map((p) => <td>
                            <label><input
                                type='radio'
                                value={p}
                                name={'claim-' + r + this.suitIndicator} {
                                ...{ disabled: this.disabled[r + this.suitIndicator] }
                                }
                                {
                                ...{ checked: this.state.possessions[p][r + this.suitIndicator] }
                                }
                                onChange={
                                    () => this.handleOptionChange(r + this.suitIndicator, p)
                                } />
                            Player {p} </label>
                        </td>)}
                </tr>
            ))}
        </table>);
        return <div>
            {selectors}
            <button onClick={this.makeClaim.bind(this)}>Claim</button>
        </div>
    }
}