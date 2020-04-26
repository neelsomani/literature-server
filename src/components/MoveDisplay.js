import React, { Component } from 'react';

export default class MoveDisplay extends Component {
    render() {
        if (this.props.interrogator === undefined) {
            return <div className='MoveDisplay'>
                No move has been executed yet.
            </div>
        }
        const success = (this.props.success && 'Success') || 'Failure';
        return <div className='MoveDisplay'>
            {success}: {this.props.playerNames[this.props.interrogator.toString()]}
            {' ' + this.props.card} from {this.props.playerNames[
                this.props.respondent.toString()]}
        </div>
    }
}
