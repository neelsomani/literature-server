import React, { Component } from 'react';

export default class MoveDisplay extends Component {
    render() {
        if (this.props.interrogator === undefined) {
            return <div class='MoveDisplay'>
                No move has been executed yet.
            </div>
        }
        const success = this.props.success && 'Success' || 'Failure';
        return <div class='MoveDisplay'>
            {success}: Player {this.props.interrogator}
            {' ' + this.props.card} from Player {this.props.respondent}
        </div>
    }
}
