import React, { Component } from 'react';

export default class ClaimDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            lastHalfSuit: this.props.halfSuit
        };
    }

    componentDidUpdate() {
        if (this.props.halfSuit !== this.state.lastHalfSuit) {
            const lastTimeout =
                setTimeout(() => this.setState({ show: false }), 15 * 1000);
            clearTimeout(this.state.lastTimeout);
            this.setState({
                show: true,
                lastHalfSuit: this.props.halfSuit,
                lastTimeout
            });
        }
    }

    render() {
        const success = (this.props.success && 'Success') || 'Failure';
        return <div className='ClaimDisplay'>
            {(this.props.halfSuit !== undefined)
                && this.state.show
                && (
                    <div className='ClaimText'>
                        <a href='#!'
                            className='ShowFullClaimLink'
                            onClick={() => this.props.showFullClaim()}>{success}</a>:
                        {' '}{this.props.playerNames[this.props.claimBy.toString()]} claims
                        {' ' + this.props.halfSuit.half + ' ' + this.props.halfSuit.suit}
                    </div>
                )}
        </div>
    }
}
