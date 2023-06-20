const map = new Map([["p", -1], ["n", -3], ["b", -3], ["r", -5], ["q", -9], ["k", 0], ["P", 1], ["N", 3],["B", 3], ["R", 5], ["Q", 9], ["K", 0]]);

export function fen2matrix(fen) {

    let matrix = [[null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]];

    if (!fen) {
        return matrix;
    }
    
    let pos = 0;
    for (let i=0; i<8; i++) {
        for (let j=0; j<8;) {
            let c = fen.charAt(pos++);
            if (c === '/') {
                continue;
            }
			else if (map.has(c)) {
            	matrix[i][j] = c;
            	j++;
            }
            else {
                j += parseInt(c);
            }            
        }
    }
    
    return matrix;
}

/*
 * Returns a list of pieces captured by the specified color.  This can get confusing when pawns are promoted.  So really
 * it's the list of pieces originally on the board minus the pieces that are currently on the board.  This means that
 * when a pawn is promoted the pawn is added to the list and a queen could be removed from the list, if a queen has already
 * been taken off the board. 
 */   
export function captured(fen, color) {
	
	let pieces = ['p','p','p','p','p','p','p','p','n','n','b','b','r','r','q'];	
	
    let pos = 0;
    for (let i=0; i<8; i++) {
        for (let j=0; j<8;) {
            let c = fen.charAt(pos++);
            if (c === '/') {
                continue;
            }
			else if ((color === 'w') && (c === c.toLowerCase()) && (pieces.indexOf(c) > -1)) {
				let index = pieces.indexOf(c);
				if (index > -1) {
					pieces.splice(index, 1);
				}
				j++;
            }
			else if ((color === 'b') && (c === c.toUpperCase()) && (pieces.indexOf(c.toLowerCase()) > -1)) {
				let index = pieces.indexOf(c.toLowerCase());
				if (index > -1) {
					pieces.splice(index, 1);
				}
				j++;
            }
            else if (map.has(c)) {
                j++;
            }            
            else {
                j += parseInt(c);
            }            
        }
    }
    
    // TODO: simplify this loop by continuing until a space is found

	return pieces;
}

/*
 * Calculates a score for the specified color by taking the sum of the values of all of that color's pieces on the board and subtracting
 * the sum of the value of all of the other color's pieces on the board. 
 */
export function score(fen, color) {
	
	let score = 0;
 	
    let pos = 0;
    for (let i=0; i<8; i++) {
        for (let j=0; j<8;) {
            let c = fen.charAt(pos++);
            if (c === '/') {
                continue;
            }
			else if (map.has(c)) {
            	score += map.get(c);
            	j++;
            }
            else {
                j += parseInt(c);
            }            
        }
    }
    
    // TODO: simplify this loop by continuing until a space is found

	if (color === 'w') {
		return score;	
	}
	else {
		return -score;
	}
    
}

export function minimax(chessjs, depth, san) {

	if (depth === 0) {
		let value = score(chessjs.fen());
		console.log("evaluated move: " + san + ", score: " + value);
		return value;
	}

	let turn = chessjs.turn();
	let moves = chessjs.moves({ verbose: true });

	let value;

	if (turn === 'w') {
		value = -1000;			
		for (let i=0; i<moves.length; i++) {				
			chessjs.move({from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion});
			value = Math.max(value, minimax(chessjs, depth-1, san + " " + moves[i].san));
			chessjs.undo();
		}
	}
	else {
		value = 1000;
		for (let i=0; i<moves.length; i++) {
			chessjs.move({from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion});
			value = Math.min(value, minimax(chessjs, depth-1, san + " " + moves[i].san));
			chessjs.undo();
		}
	}
	
	return value;
}