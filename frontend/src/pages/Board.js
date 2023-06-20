import React from 'react'

import Square from './Square'
import * as Utils from './Utils'

function Board(props) {

    const matrix = Utils.fen2matrix(props.fen);
    const squares = [];

    for (let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {
            const square =
                 <Square
                    key={row * 8 + col}
                    shade={row % 2 === col % 2 ? "light" : "dark"}
                    piece={matrix[row][col]}
                    selected={(props.selected != null) && (props.selected.row === row) && (props.selected.col === col)}
                    lastFrom={((props.lastFrom != null) && (props.lastFrom.row === row) && (props.lastFrom.col === col))}
                    lastTo={((props.lastTo != null) && (props.lastTo.row === row) && (props.lastTo.col === col))}
                    handleClickSquare={() => props.handleClickSquare(row, col)}  
	                inCheck={props.inCheck}          
                />
            squares.push(square);
        }
    }

    if (props.orientation === 1) {
        squares.reverse();
    }

    return (
        <div className="board">
            {squares}
        </div>
    );
}

export default Board