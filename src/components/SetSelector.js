import React, { Component } from 'react';
import { SETS } from './Constants';

export default class SetSelector extends Component {
    constructor(props) {
        const {
            set,
            team,
            correct,
            nPlayers
        } = props;
        super(props);
        this.rankIndicator = set[0];
        this.suitIndicator = set[1];
        const possessions = {};
        [...Array(nPlayers).keys()]
            .filter((p) => (team === undefined) || p % 2 === team)
            .forEach((p) => {
                possessions[p] = {};
                SETS[this.rankIndicator].forEach(
                    (r) => possessions[p][r + this.suitIndicator] =
                        (correct || {})[r + this.suitIndicator] === p);
            });
        const disabled = {};
        SETS[this.rankIndicator].forEach(
            (r) => disabled[r + this.suitIndicator] =
                (r + this.suitIndicator) in (correct || {}));
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
                if (c === card && parseInt(p) !== player) {
                    possessions[p][c] = false;
                } else if (c === card && parseInt(p) === player) {
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

    radioButton(card, player) {
        return <input
            type='radio'
            value={player}
            name={'claim-' + card}
            {...{ disabled: this.disabled[card] }}
            {...{ checked: this.state.possessions[player][card] }}
            onChange={() => this.handleOptionChange(card, player)} />
    }

    render() {
        const selectors = (<table>
            <tbody>
                {SETS[this.rankIndicator].map((r) => (
                    <tr key={'card-selector-' + r + this.suitIndicator}>
                        <td key={'label-' + r + this.suitIndicator}>
                            {r}{this.suitIndicator}:</td>
                        {[...Array(this.props.nPlayers).keys()]
                            .filter((p) => (this.props.team === undefined) ||
                                (p % 2 === this.props.team))
                            .map((p) =>
                                <td key={'indicator-' + r + this.suitIndicator + '-' + p}>
                                    <label>{this.radioButton(r + this.suitIndicator, p)}
                            Player {p} </label>
                                </td>)}
                    </tr>
                ))}
            </tbody>
        </table>);
        return <div>
            {selectors}
            {this.props.makeClaim
                && <button
                    className='MakeClaimButton'
                    onClick={this.makeClaim.bind(this)}>Claim</button>}
        </div>
    }
}