import React from 'react'

import { ReactComponent as CapturedRook } from './images/wikipedia/rgt45.svg';
import { ReactComponent as CapturedKnight } from './images/wikipedia/ngt45.svg';
import { ReactComponent as CapturedBishop } from './images/wikipedia/bgt45.svg';
import { ReactComponent as CapturedQueen } from './images/wikipedia/qgt45.svg';
import { ReactComponent as CapturedPawn } from './images/wikipedia/pgt45.svg';

import * as Utils from './Utils'

function Captured(props) {

    const pieces = [];

	let caps = Utils.captured(props.fen, props.color);
	
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

	// display score if positive
    let score = Utils.score(props.fen, props.color);
    if (score > 0) {
        score = "+" + score;
    }
    else {
		score = "";
	}
    
    return (
        <div>
            {pieces}<span className="score">{score}</span>
        </div>
    );
}

export default Captured