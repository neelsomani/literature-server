import React, { Component } from 'react';

import PlayerEvenIcon from './player-even.png';
import PlayerOddIcon from './player-odd.png';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: Date.now() / 1000
        };
    }

    updateTime() {
        this.setState({ time: Date.now() / 1000 });
        if (this.timeRemaining() < 0) {
            this.props.switchTeam();
        }
    }

    timeRemaining() {
        const timeLimit = parseInt(this.props.timeLimit, 10);
        const moveTimestamp = parseInt(this.props.moveTimestamp, 10);
        const currentTime = parseInt(this.state.time, 10);
        return timeLimit + moveTimestamp - currentTime;
    }

    componentDidMount() {
        this.interval = setInterval(this.updateTime.bind(this), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const timeRemaining = this.timeRemaining()
        const img = [PlayerEvenIcon, PlayerOddIcon][this.props.playerN % 2]
        const icon = (
            <span style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                <img src={img} height={15} width={15} /> Player {this.props.playerN}
            </span>
        )
        return <div className='Timer'>
            {timeRemaining} second{(timeRemaining != 1) && 's'} //
            {(this.props.playerN != -1)
                && this.props.playerN !== undefined
                && icon
                || ' Visitor'}
            {(this.props.turn !== undefined && this.props.playerN == this.props.turn)
                && '// Click a player from the opposite team to request a card'}
        </div>
    }
}
