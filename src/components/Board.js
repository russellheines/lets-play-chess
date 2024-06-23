import { Chess } from 'chess.js';

import Square from './Square'

function Board(props) {

    const chessjs = new Chess(props.fen);
    const board = [];
    for (let row = 0; row <= 7; row++) {
        const arr = [];
        for (let col = 0; col <= 7; col++) {
            const sq = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
            const piece = chessjs.get(sq);
            if (piece) {
                arr.push(piece.color === 'b' ? piece.type : piece.type.toUpperCase());
            }
            else {
                arr.push(null);
            }
        }
        board.push(arr);
    }

    const squares = [];
    for (let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {
            const square =
                 <Square
                    key = {row * 8 + col}
                    row = {row}
                    col = {col}
                    shade = {row % 2 === col % 2 ? "light" : "dark"}
                    piece = {board[row][col]}
                    selected = {(props.selected != null) && (props.selected.row === row) && (props.selected.col === col)}
                    lastFrom = {((props.lastFrom != null) && (props.lastFrom.row === row) && (props.lastFrom.col === col))}
                    lastTo = {((props.lastTo != null) && (props.lastTo.row === row) && (props.lastTo.col === col))}
                    inCheck = {props.inCheck}
                    orientation = {props.orientation}
                    handleClickSquare = {() => props.handleClickSquare(row, col)}
                />
            squares.push(square);
        }
    }

    if (props.orientation === 1) {
        squares.reverse();
    }

    return (
        <div className="board box-shadow">
            {squares}
        </div>
    );
}

export default Board