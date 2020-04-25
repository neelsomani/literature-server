import React, { Component } from 'react';

export default class ClaimDisplay extends Component {
    constructor(props) {
        super(props);
        const show = this.props.halfSuit !== undefined;
        this.state = { show };
        setTimeout(() => this.setState({ show: false }), 15 * 1000);
    }

    render() {
        const success = this.props.success && 'Success' || 'Failure';
        return <div className='ClaimDisplay'>
            {this.state.show && (
                <div>
                    <a href='#!'
                        style={{ color: '#10104a' }}
                        onClick={() => this.props.showFullClaim()}>{success}</a>:
                    {' '}Player {this.props.claimBy} claims
                    {' ' + this.props.halfSuit.half + ' ' + this.props.halfSuit.suit}
                </div>
            )}
        </div>
    }
}
