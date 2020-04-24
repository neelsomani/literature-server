import React, { Component } from 'react';

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
        return <div class='Timer'>
            {timeRemaining} second{(timeRemaining != 1) && 's'} //
            {(this.props.playerN != -1)
                && this.props.playerN !== undefined
                && (' Player ' + this.props.playerN)
                || ' Visitor'}
        </div>
    }
}
