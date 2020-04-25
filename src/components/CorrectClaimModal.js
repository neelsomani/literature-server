import React, { Component } from 'react';
import SetSelector from './SetSelector';

export default class ClaimModal extends Component {
    render() {
        return <div className='CorrectClaimCover'>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 5
            }} onClick={this.props.hideModal}></div>
            <div className='CardSelector' style={{ zIndex: 10 }}>
                <SetSelector
                    nPlayers={this.props.nPlayers}
                    correct={this.props.correct}
                    set={this.props.set} />
            </div>
        </div>
    }
}
