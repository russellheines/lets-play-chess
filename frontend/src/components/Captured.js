import React from 'react'

import { ReactComponent as CapturedRook } from '../assets/wikipedia/rgt45.svg';
import { ReactComponent as CapturedKnight } from '../assets/wikipedia/ngt45.svg';
import { ReactComponent as CapturedBishop } from '../assets/wikipedia/bgt45.svg';
import { ReactComponent as CapturedQueen } from '../assets/wikipedia/qgt45.svg';
import { ReactComponent as CapturedPawn } from '../assets/wikipedia/pgt45.svg';

import { getCaptured, getScore } from '../utils/utils';

function Captured(props) {

    const fen = props.state.fen[props.state.time];

    const pieces = [];

	let caps = getCaptured(fen, props.color);
	
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
	
	// only display score if it's positive
    let s = getScore(fen, props.color);
    s = s > 0 ? "+" + s : "";
    
    return (
        <div className="capturedContainer">
            {pieces}<span className="score">{s}</span>
        </div>
    );
}

export default Captured