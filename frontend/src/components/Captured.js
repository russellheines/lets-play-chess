import React from 'react'

import { ReactComponent as CapturedRook } from '../assets/wikipedia/rgt45.svg';
import { ReactComponent as CapturedKnight } from '../assets/wikipedia/ngt45.svg';
import { ReactComponent as CapturedBishop } from '../assets/wikipedia/bgt45.svg';
import { ReactComponent as CapturedQueen } from '../assets/wikipedia/qgt45.svg';
import { ReactComponent as CapturedPawn } from '../assets/wikipedia/pgt45.svg';

/*
 * Returns a list of pieces captured by the specified color, which can be confusing when pawns are promoted.
 * 
 *  1. Start with a list of all pieces that were initially on the board (p = 8, n = 2, b = 2, n = 2, q = 1, k = 1)
 *  2. For each piece currently on the board:
 *      a. If it's in the list, remove it
 *      b. If it's not in the list, it must be a promoted pawn so remove a pawn from the list
 *  3. The resulting list is what has been captured
 */   
function captured(fen, color) {

    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

	let list = ['p','p','p','p','p','p','p','p','n','n','b','b','r','r','q','k'];	
	
    for (let i=0; i<fen.indexOf(' '); i++) {
        let c = fen.charAt(i);
        if (((color === 'w') && (['p','n','b','r','q','k'].includes(c))) || ((color === 'b') && (['P','N','B','R','Q','K'].includes(c)))) {
            let j = list.indexOf(c.toLowerCase());
            if (j > -1) {
                list.splice(j, 1);
            }
            else {
                j = list.indexOf('p');
                if (j > -1) {
                    list.splice(j, 1);
                }
            }
        }
    }

    return list;
}

/*
 * Calculates a score for the specified color by just adding up the values of all pieces on the board.
 */
function score(fen, color) {
	
    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

    const map = new Map([['p', -1], ['n', -3], ['b', -3], ['r', -5], ['q', -9], ['P', 1], ['N', 3],['B', 3], ['R', 5], ['Q', 9]]);

    let score = 0;

    for (let i=0; i<fen.indexOf(' '); i++) {
        let c = fen.charAt(i);
        if (map.has(c)) {
            score += map.get(c);
        }
    }

    return color === 'w' ? score : -score;
}

function Captured(props) {

    if (props.fen.length === 0) {
        return;
    }

    const pieces = [];

	let caps = captured(props.fen, props.color);
	
    for (let i=0; i<caps.length; i++) {
        if (caps[i] === 'p') {
            pieces.push(<CapturedPawn className="captured capturedPawn" key={i}/>);
        }
        else if (caps[i] === 'n') {
            pieces.push(<CapturedKnight className="captured capturedKnight" key={i}/>);
        }
        else if (caps[i] === 'b') {
            pieces.push(<CapturedBishop className="captured capturedBishop" key={i}/>);
        }
        else if (caps[i] === 'r') {
            pieces.push(<CapturedRook className="captured capturedRook" key={i}/>);
        }
        else if (caps[i] === 'q') {
            pieces.push(<CapturedQueen className="captured capturedQueen" key={i}/>);
        }
    }
	
    if (pieces.length === 0) {
        pieces.push(<CapturedPawn className="captured capturedPawn" key="0" style={{opacity: "0"}}/>);  // placeholder
    }

	// only display score if it's positive
    let s = score(props.fen, props.color);
    s = s > 0 ? "+" + s : "";
    
    return (
        <div className="capturedContainer">
            {pieces}<span className="score">{s}</span>
        </div>
    );
}

export default Captured