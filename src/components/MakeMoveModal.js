import React, { Component } from 'react';
import VerticalCards from './VerticalCards';

export default class MakeMoveModal extends Component {
    render() {
        return <div class='MakeMoveCover'>
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
            }} onClick={this.props.toggleModal}></div>
            <div class='CardSelector' style={{ zIndex: 10 }}>
                <VerticalCards
                    respondent={this.props.respondent}
                    suitClass='active-hand'
                    cards={['AS', '2S', '3C', '2C', 'AH', 'KD']} />
            </div>
        </div>
    }
}
