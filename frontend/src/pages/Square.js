import React from 'react'

import { ReactComponent as BlackRook } from '../images/wikipedia/rdt45.svg';
import { ReactComponent as BlackKnight } from '../images/wikipedia/ndt45.svg';
import { ReactComponent as BlackBishop } from '../images/wikipedia/bdt45.svg';
import { ReactComponent as BlackQueen } from '../images/wikipedia/qdt45.svg';
import { ReactComponent as BlackKing } from '../images/wikipedia/kdt45.svg';
import { ReactComponent as BlackPawn } from '../images/wikipedia/pdt45.svg';
import { ReactComponent as WhiteRook } from '../images/wikipedia/rlt45.svg';
import { ReactComponent as WhiteKnight } from '../images/wikipedia/nlt45.svg';
import { ReactComponent as WhiteBishop } from '../images/wikipedia/blt45.svg';
import { ReactComponent as WhiteQueen } from '../images/wikipedia/qlt45.svg';
import { ReactComponent as WhiteKing } from '../images/wikipedia/klt45.svg';
import { ReactComponent as WhitePawn } from '../images/wikipedia/plt45.svg';

const map = new Map();
map.set('r', <BlackRook/>);
map.set('n', <BlackKnight/>);
map.set('b', <BlackBishop/>);
map.set('q', <BlackQueen/>);
map.set('k', <BlackKing/>);
map.set('p', <BlackPawn/>);
map.set('R', <WhiteRook/>);
map.set('N', <WhiteKnight/>);
map.set('B', <WhiteBishop/>);
map.set('Q', <WhiteQueen/>);
map.set('K', <WhiteKing/>);
map.set('P', <WhitePawn/>);

function Square(props) {

    const image = map.get(props.piece);

    const styles = ["square"];
    styles.push(props.shade);
    
    if (props.selected) {
        styles.push("selected");
    }
    if (props.lastFrom) {
        styles.push("lastFrom");
    }
    if (props.lastTo) {
        styles.push("lastTo");
    }
    if ((props.inCheck === 0) && (props.piece === 'K')) {
        styles.push("check");
    }
    else if ((props.inCheck === 1) && (props.piece === 'k')) {
        styles.push("check");
    }
        
    return (
        <div className={styles.join(" ")} onClick={props.handleClickSquare}>
            {image}
         </div>
    );
}

export default Square