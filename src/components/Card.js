import React, { Component } from 'react';

import TEN_C from './cards/10C.svg';
import TEN_D from './cards/10D.svg';
import TEN_H from './cards/10H.svg';
import TEN_S from './cards/10S.svg';
import TWO_C from './cards/2C.svg';
import TWO_D from './cards/2D.svg';
import TWO_H from './cards/2H.svg';
import TWO_S from './cards/2S.svg';
import THREE_C from './cards/3C.svg';
import THREE_D from './cards/3D.svg';
import THREE_H from './cards/3H.svg';
import THREE_S from './cards/3S.svg';
import FOUR_C from './cards/4C.svg';
import FOUR_D from './cards/4D.svg';
import FOUR_H from './cards/4H.svg';
import FOUR_S from './cards/4S.svg';
import FIVE_C from './cards/5C.svg';
import FIVE_D from './cards/5D.svg';
import FIVE_H from './cards/5H.svg';
import FIVE_S from './cards/5S.svg';
import SIX_C from './cards/6C.svg';
import SIX_D from './cards/6D.svg';
import SIX_H from './cards/6H.svg';
import SIX_S from './cards/6S.svg';
import SEVEN_C from './cards/7C.svg';
import SEVEN_D from './cards/7D.svg';
import SEVEN_H from './cards/7H.svg';
import SEVEN_S from './cards/7S.svg';
import EIGHT_C from './cards/8C.svg';
import EIGHT_D from './cards/8D.svg';
import EIGHT_H from './cards/8H.svg';
import EIGHT_S from './cards/8S.svg';
import NINE_C from './cards/9C.svg';
import NINE_D from './cards/9D.svg';
import NINE_H from './cards/9H.svg';
import NINE_S from './cards/9S.svg';
import A_C from './cards/AC.svg';
import A_D from './cards/AD.svg';
import A_H from './cards/AH.svg';
import A_S from './cards/AS.svg';
import J_C from './cards/JC.svg';
import J_D from './cards/JD.svg';
import J_H from './cards/JH.svg';
import J_S from './cards/JS.svg';
import K_C from './cards/KC.svg';
import K_D from './cards/KD.svg';
import K_H from './cards/KH.svg';
import K_S from './cards/KS.svg';
import Q_C from './cards/QC.svg';
import Q_D from './cards/QD.svg';
import Q_H from './cards/QH.svg';
import Q_S from './cards/QS.svg';

export default class Card extends Component {
    cardMap = {
        '10C': TEN_C,
        '10D': TEN_D,
        '10H': TEN_H,
        '10S': TEN_S,
        '2C': TWO_C,
        '2D': TWO_D,
        '2H': TWO_H,
        '2S': TWO_S,
        '3C': THREE_C,
        '3D': THREE_D,
        '3H': THREE_H,
        '3S': THREE_S,
        '4C': FOUR_C,
        '4D': FOUR_D,
        '4H': FOUR_H,
        '4S': FOUR_S,
        '5C': FIVE_C,
        '5D': FIVE_D,
        '5H': FIVE_H,
        '5S': FIVE_S,
        '6C': SIX_C,
        '6D': SIX_D,
        '6H': SIX_H,
        '6S': SIX_S,
        '7C': SEVEN_C,
        '7D': SEVEN_D,
        '7H': SEVEN_H,
        '7S': SEVEN_S,
        '8C': EIGHT_C,
        '8D': EIGHT_D,
        '8H': EIGHT_H,
        '8S': EIGHT_S,
        '9C': NINE_C,
        '9D': NINE_D,
        '9H': NINE_H,
        '9S': NINE_S,
        'AC': A_C,
        'AD': A_D,
        'AH': A_H,
        'AS': A_S,
        'JC': J_C,
        'JD': J_D,
        'JH': J_H,
        'JS': J_S,
        'KC': K_C,
        'KD': K_D,
        'KH': K_H,
        'KS': K_S,
        'QC': Q_C,
        'QD': Q_D,
        'QH': Q_H,
        'QS': Q_S
    }

    render() {
        return <img class='card' src={this.cardMap[this.props.card]} />
    }
}
