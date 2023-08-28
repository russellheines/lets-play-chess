import { Chess } from 'chess.js';

/**
 * Returns a Square for the given row and column.  For example:
 * 
 *   row = 0, col = 0 => a8
 *   row = 4, col = 4 => e4
 * 
 */
export function getSquare(row, col) {    
    return String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
}

/**
 * Validates if the use can select a piece at the given row and column and returns true or false.
 */
export function validateSelection(state, row, col) {

    // check if the game has started
    if (state.time < 0) {
        return false;
    }

	// check if looking at the most recent move
	if (state.time !== state.fen.length - 1) {
		return false;
	}

    const sq = getSquare(row, col);
    const chessjs = new Chess(state.fen[state.time]);

	// check if playing as white and it's not white's turn
	if ((state.color === 0) && (chessjs.turn() !== 'w')) {
		return false;
	}

	// check if playing as black and it's not black's turn
	if ((state.color === 1) && (chessjs.turn() !== 'b')) {
		return false;
	}

	// check if there is a piece at this square
	if (chessjs.get(sq) === null) {
		return false;
	}

	// check if playing as white and the piece at this square is not white
	if ((state.color === 0) && (chessjs.get(sq).color !== 'w')) {
		return false;
	}

	// check if playing as black and the piece at this square is not black
	if ((state.color === 1) && (chessjs.get(sq).color !== 'b')) {
		return false;
	}


    return true;
}

/**
 * Validates if the user can move a selected piece to the given row and column and returns the validated move or null.
 */
export function validateMove(state, row, col) {

    // check if a piece is selected
    if (!state.selected) {
        return null;
    }

    const chessjs = new Chess(state.fen[state.time]);
		
    const from = getSquare(state.selected.row, state.selected.col);
    const to = getSquare(row, col);

    let move = null;

    try {
        if (((chessjs.get(from).type === 'p') && (chessjs.get(from).color === 'w') && (row === 0)) ||
            ((chessjs.get(from).type === 'p') && (chessjs.get(from).color === 'b') && (row === 7))) {
            move = chessjs.move({ from: from, to: to, promotion: 'q' });
        }
        else {
            move = chessjs.move({ from: from, to: to });
        }
    }
    catch (err) {
        console.log(err);
    }

    return move;
}

/**
 * Returns a list of pieces captured by the specified color, which can be confusing when pawns are promoted.
 * 
 *  1. Start with a list of all pieces that were initially on the board (p = 8, n = 2, b = 2, n = 2, q = 1, k = 1)
 *  2. For each piece currently on the board:
 *      a. If it's in the list, remove it
 *      b. If it's not in the list, it must be a promoted pawn so remove a pawn from the list
 *  3. The resulting list is what has been captured
 * 
 */   
export function getCaptured(fen, color) {

    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

    if (!fen) {
        return [];
    }

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

/** 
 * Calculates a score for the specified color by just adding up the values of all pieces on the board.
 */
export function getScore(fen, color) {
	
    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

    if (!fen) {
        return [];
    }
    
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