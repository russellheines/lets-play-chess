import React from 'react'

import { Chess } from 'chess.js';

import { getSquare } from "../utils/utils";
import Square from './Square'

function Board(props) {

    const fen = props.state.fen[props.state.time];
    const orientation = props.state.orientation;
    const selected = props.state.selected;
    const lastFrom = props.state.lastFrom[props.state.time];
    const lastTo = props.state.lastTo[props.state.time];
    const inCheck = props.state.inCheck[props.state.time];

    let chessjs = null;
    if (fen) {
        chessjs = new Chess(fen);
    }

    const squares = [];

    for (let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {

            let piece = null;
            if (chessjs) {
                piece = chessjs.get(getSquare(row, col));
            }

            const square =
                 <Square
                    key={row * 8 + col}
                    shade={row % 2 === col % 2 ? "light" : "dark"}
                    piece={piece}
                    selected={(selected != null) && (selected.row === row) && (selected.col === col)}
                    lastFrom={((lastFrom != null) && (lastFrom.row === row) && (lastFrom.col === col))}
                    lastTo={((lastTo != null) && (lastTo.row === row) && (lastTo.col === col))}
                    inCheck={inCheck}
                    handleClickSquare={() => props.handleClickSquare(row, col)}
                    row={row}
                    col={col}
                    orientation={orientation}
                />
            squares.push(square);
        }
    }

    if (orientation === 1) {
        squares.reverse();
    }

    return (
        <div className="board">
            {squares}
        </div>
    );
}

export default Board