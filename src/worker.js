import { Chess } from 'chess.js';

/*
 * Fisher–Yates
 */
function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }

/*
 * Evaluates a board position by adding up the values of each piece on the board.  Positive values
 * favor white and negative values favor black.
 */
export function evaluate(chessjs) {
    const values = {'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9};

    const fen = chessjs.fen();

    let value = 0;
    for (let i=0; i<fen.indexOf(" "); i++) {
        if (values[fen.charAt(i)]) {
            value += values[fen.charAt(i)];
        }
    }

    return value;
}

/*
 * Implements the minimax search algorithm, where white is the maximizing player and black is the
 * minimizing player.
 */
export function minimax(chessjs, initialDepth, currentDepth, maximizingPlayer) {
    let best = [];
    let evaluations = 0;

    if (currentDepth === 0) {
        let score = evaluate(chessjs);
        return {score: score, best: best, evaluations: 1};
    }

    const moves = shuffle(chessjs.moves({verbose: true}));

    if (maximizingPlayer) {
        let max = Number.NEGATIVE_INFINITY;
        for (let i=0; i < moves.length; i++) {
            chessjs.move(moves[i]);
            let result = minimax(chessjs, initialDepth, currentDepth-1, false);
            let score = result.score;
            evaluations += result.evaluations;
            chessjs.undo();

            if (score > max) {
                max = score;
                best = [];
                best.push(moves[i]);
            }
            else if (score === max) {
                best.push(moves[i]);
            }
        }

        return {score: max, best: best, evaluations: evaluations};
    }
    else {
        let min = Number.POSITIVE_INFINITY;
        for (let i=0; i < moves.length; i++) {
            chessjs.move(moves[i]);
            let result = minimax(chessjs, initialDepth, currentDepth-1, true);
            let score = result.score;
            evaluations += result.evaluations;
            chessjs.undo();

            if (score < min) {
                min = score;
                best = [];
                best.push(moves[i]);
            }
            else if (score === min) {
                best.push(moves[i]);
            }
        }

        return {score: min, best: best, evaluations: evaluations};
    }
}

/*
 * Implements the minimax search algorithm with alpha beta pruning.
 */
export function alphabeta(chessjs, initialDepth, currentDepth, maximizingPlayer, alpha, beta) {
    let best = [];
    let evaluations = 0;

    if (currentDepth === 0) {
        let score = evaluate(chessjs);
        return {score: score, best: best, evaluations: 1};
    }

    const moves = shuffle(chessjs.moves({verbose: true}));

    if (maximizingPlayer) {
        let max = Number.NEGATIVE_INFINITY;
        for (let i=0; i < moves.length; i++) {
            chessjs.move(moves[i]);
            let result = alphabeta(chessjs, initialDepth, currentDepth-1, false, alpha, beta);
            let score = result.score;
            evaluations += result.evaluations;
            chessjs.undo();

            if (score > max) {
                max = score;
                best = [];
                best.push(moves[i]);
            }
            /*else if (score === max) {
                best.push(moves[i]);
            }*/

            alpha = Math.max(alpha, score);
            if (beta <= alpha) {
                break;
            }

        }
        return {score: max, best: best, evaluations: evaluations};
    }
    else {
        let min = Number.POSITIVE_INFINITY;
        for (let i=0; i < moves.length; i++) {
            chessjs.move(moves[i]);
            let result = alphabeta(chessjs, initialDepth, currentDepth-1, true, alpha, beta);
            let score = result.score;
            evaluations += result.evaluations;
            chessjs.undo();

            if (score < min) {
                min = score;
                best = [];
                best.push(moves[i]);
            }
            /*else if (score === min) {
                best.push(moves[i]);
            }*/

            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }
        return {score: min, best: best, evaluations: evaluations};
    }
}

function move_random(chessjs) {
    const moves = chessjs.moves({verbose: true});
    const random = moves[Math.floor(Math.random() * moves.length)];

    chessjs.move({from: random.from, to: random.to, promotion: random.promotion});
    const fen = chessjs.fen();
    
    return {fen: fen, from: random.from, to: random.to, san: random.san};
}

function move_minimax(chessjs) {
    let result = minimax(chessjs, 3, 3, chessjs.turn() === 'w' ? true : false);
    let best = result.best[Math.floor(Math.random() * result.best.length)];
    
    chessjs.move({from: best.from, to: best.to, promotion: best.promotion});
    const fen = chessjs.fen();
    
    console.log("minimax evaluations: " + result.evaluations);

    return {fen: fen, from: best.from, to: best.to, san: best.san};    
}

function move_alphabeta(chessjs) {
    let result = alphabeta(chessjs, 3, 3, chessjs.turn() === 'w' ? true : false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    let best = result.best[Math.floor(Math.random() * result.best.length)];

    chessjs.move({from: best.from, to: best.to, promotion: best.promotion});
    const fen = chessjs.fen();

    console.log("alphabeta evaluations: " + result.evaluations);

    return {fen: fen, from: best.from, to: best.to, san: best.san};
}

onmessage = e => {
    const chessjs = new Chess(e.data);

    //postMessage(move_random(chessjs));
    //postMessage(move_minimax(chessjs));
    postMessage(move_alphabeta(chessjs));
}