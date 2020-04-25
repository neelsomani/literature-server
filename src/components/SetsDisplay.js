import React, { Component } from 'react';

import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';
import DiscardIcon from './no.png';

export default class SetsDisplay extends Component {
    render() {
        return <div className='SetsDisplay'>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <img
                                src={PlayerEvenIcon}
                                height={15}
                                width={15} />
                        </td>
                        <td className='EvenScore'>
                            {this.props.score.even}</td>
                    </tr>
                    <tr>
                        <td>
                            <img
                                src={PlayerOddIcon}
                                height={15}
                                width={15} />
                        </td>
                        <td className='OddScore'>
                            {this.props.score.odd}</td>
                    </tr>
                    <tr>
                        <td>
                            <img
                                src={DiscardIcon}
                                height={15}
                                width={15} />
                        </td>
                        <td className='DiscardScore'>
                            {this.props.score.discard}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    }
}
