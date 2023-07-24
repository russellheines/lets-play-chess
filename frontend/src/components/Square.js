import React from 'react'

import { ReactComponent as BlackRook } from '../assets/wikipedia/rdt45.svg';
import { ReactComponent as BlackKnight } from '../assets/wikipedia/ndt45.svg';
import { ReactComponent as BlackBishop } from '../assets/wikipedia/bdt45.svg';
import { ReactComponent as BlackQueen } from '../assets/wikipedia/qdt45.svg';
import { ReactComponent as BlackKing } from '../assets/wikipedia/kdt45.svg';
import { ReactComponent as BlackPawn } from '../assets/wikipedia/pdt45.svg';
import { ReactComponent as WhiteRook } from '../assets/wikipedia/rlt45.svg';
import { ReactComponent as WhiteKnight } from '../assets/wikipedia/nlt45.svg';
import { ReactComponent as WhiteBishop } from '../assets/wikipedia/blt45.svg';
import { ReactComponent as WhiteQueen } from '../assets/wikipedia/qlt45.svg';
import { ReactComponent as WhiteKing } from '../assets/wikipedia/klt45.svg';
import { ReactComponent as WhitePawn } from '../assets/wikipedia/plt45.svg';

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

    const svg = props.piece !== null ? map.get(props.piece.color === 'w' ? props.piece.type.toUpperCase() : props.piece.type ) : null;

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
    if ((props.inCheck === 0) && (props.piece.color === 'w') && (props.piece.type === 'k')) {
        styles.push("check");
    }
    else if ((props.inCheck === 1) && (props.piece.color === 'b') && (props.piece.type === 'k')) {
        styles.push("check");
    }

    return (
        <div className={styles.join(" ")} onClick={props.handleClickSquare}>
            {svg}
            {props.orientation === 0 && props.col === 7 && <div className="rank">{8 - props.row}</div>}
            {props.orientation === 1 && props.col === 0 && <div className="rank">{8 - props.row}</div>}
            {props.orientation === 0 && props.row === 7 && <div className="file">{String.fromCharCode(97 + props.col)}</div>}
            {props.orientation === 1 && props.row === 0 && <div className="file">{String.fromCharCode(97 + props.col)}</div>}
         </div>
    );
}

export default Square