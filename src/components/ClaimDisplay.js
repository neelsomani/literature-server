import React, { Component } from 'react';

export default class ClaimDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = { show: true };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.halfSuit != this.props.halfSuit) {
            const lastTimeout =
                setTimeout(() => this.setState({ show: false }), 15 * 1000);
            clearTimeout(this.state.lastTimeout);
            this.setState({
                show: true,
                lastTimeout
            });
        }
    }

    render() {
        const success = this.props.success && 'Success' || 'Failure';
        return <div className='ClaimDisplay'>
            {(this.props.halfSuit !== undefined)
                && this.state.show
                && (
                    <div className='ClaimText'>
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
