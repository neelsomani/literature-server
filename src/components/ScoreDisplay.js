import React, { Component } from 'react';

import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';
import DiscardIcon from './no.png';

export default class ScoreDisplay extends Component {
    render() {
        const scores = [
            {
                icon: PlayerEvenIcon,
                score: this.props.score.even,
                className: 'EvenScore'
            },
            {
                icon: PlayerOddIcon,
                score: this.props.score.odd,
                className: 'OddScore'
            },
            {
                icon: DiscardIcon,
                score: this.props.score.discard,
                className: 'DiscardScore'
            }
        ]
        return <div className='ScoreDisplay'>
            <table>
                <tbody>
                    {scores.map((s) =>
                        <tr key={s.className + '-container'}>
                            <td>
                                <img
                                    alt={s.className}
                                    src={s.icon}
                                    height={15}
                                    width={15} />
                            </td>
                            <td className={s.className}>
                                {s.score}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    }
}
