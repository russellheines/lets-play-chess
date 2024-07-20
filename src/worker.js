import { Chess } from 'chess.js';

class Engine {

    constructor(fen) {
        this.chessjs = new Chess(fen);
    }

    /*
     * Evaluates a board position by adding up the values of each piece on the board.  Positive values
     * favor white and negative values favor black.
     */
    evaluate() {
        const values = {'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9};

        const fen = this.chessjs.fen();

        let value = 0;
        for (let i=0; i<fen.indexOf(" "); i++) {
            if (values[fen.charAt(i)]) {
                value += values[fen.charAt(i)];
            }
        }

        return value;
    }

    /*
     * Implements the minimax search algorithm for finding the best move, where white is the maximizing
     * player and black is the minimizing player.
     */
    minimax_root(initialDepth, maximizingPlayer) {
        return this.minimax(initialDepth, initialDepth, maximizingPlayer);
    }
    
    minimax(initialDepth, currentDepth, maximizingPlayer) {
        let best = [];

        if (currentDepth === 0) {
            let score = this.evaluate();
            return {score: score, best: best};
        }

        const moves = this.chessjs.moves({verbose: true});

        if (maximizingPlayer) {
            let max = -999;
            for (let i=0; i < moves.length; i++) {
                this.chessjs.move(moves[i]);
                let minimax = this.minimax(initialDepth, currentDepth-1, false);
                let score = minimax.score;
                this.chessjs.undo();

                if (score > max) {
                    max = score;
                    best = [];
                    best.push(moves[i]);
                }
                else if (score === max) {
                    best.push(moves[i]);
                }
            }
            return {score: max, best: best};
        }    
        else {
            let min = 999;
            for (let i=0; i < moves.length; i++) {
                this.chessjs.move(moves[i]);
                let minimax = this.minimax(initialDepth, currentDepth-1, true);
                let score = minimax.score;
                this.chessjs.undo();

                if (score < min) {
                    min = score;
                    best = [];
                    best.push(moves[i]);
                }
                else if (score === min) {
                    best.push(moves[i]);
                }
            }
            return {score: min, best: best};
        }    
    }

    /*
     * Implements alpha beta pruning, where alpha and beta keep track of the best score either side
     * can acheive, assuming best play from the opponent.
     */
    alphabeta_root(initialDepth, maximizingPlayer) {
        return this.alphabeta(initialDepth, initialDepth, -999, 999, maximizingPlayer);
    }

    alphabeta(initialDepth, currentDepth, alpha, beta, maximizingPlayer) {
        let best = [];

        if (currentDepth === 0) {
            let score = this.evaluate();
            return {score: score, best: best};
        }

        const moves = this.chessjs.moves({verbose: true});

        if (maximizingPlayer) {
            let max = -999;
            for (let i=0; i < moves.length; i++) {
                this.chessjs.move(moves[i]);
                let minimax = this.alphabeta(initialDepth, currentDepth-1, alpha, beta, false);
                let score = minimax.score;
                this.chessjs.undo();

                if (score > max) {
                    max = score;
                    best = [];
                    best.push(moves[i]);
                }
                else if (score === max) {
                    best.push(moves[i]);
                }

                if (score > alpha) {
                    alpha = score;
                }
                if (beta <= alpha) {
                    break;
                }
            }
            return {score: max, best: best};
        }    
        else {
            let min = 999;
            for (let i=0; i < moves.length; i++) {
                this.chessjs.move(moves[i]);
                let minimax = this.alphabeta(initialDepth, currentDepth-1, alpha, beta, true);
                let score = minimax.score;
                this.chessjs.undo();

                if (score < min) {
                    min = score;
                    best = [];
                    best.push(moves[i]);
                }
                else if (score === min) {
                    best.push(moves[i]);
                }

                if (score < beta) {
                    beta = score;
                }
                if (beta <= alpha) {
                    break;
                }
            }
            return {score: min, best: best};
        }    
    }

    move_random() {
        const moves = this.chessjs.moves({verbose: true});
        for (let i=0; i< moves.length; i++) {
            console.log(moves[i].to + ", " + moves[i].from + " : " + moves[i].promotion);
        }
        const random = moves[Math.floor(Math.random() * moves.length)];

        this.chessjs.move({from: random.from, to: random.to, promotion: random.promotion});
        const fen = this.chessjs.fen();
        
        return {fen: fen, from: random.from, to: random.to, san: random.san};
    }

    move_minimax() {
        let minimax = this.minimax_root(2, this.chessjs.turn() === 'w' ? true : false);
        let best = minimax.best[Math.floor(Math.random() * minimax.best.length)];;
        
        this.chessjs.move({from: best.from, to: best.to, promotion: best.promotion});
        const fen = this.chessjs.fen();

        return {fen: fen, from: best.from, to: best.to, san: best.san};
    }

    move_alphabeta() {
        let minimax = this.alphabeta_root(3, this.chessjs.turn() === 'w' ? true : false);
        let best = minimax.best[Math.floor(Math.random() * minimax.best.length)];;
        
        this.chessjs.move({from: best.from, to: best.to, promotion: best.promotion});
        const fen = this.chessjs.fen();

        return {fen: fen, from: best.from, to: best.to, san: best.san};
    }
}

onmessage = e => {
    const engine = new Engine(e.data);
    //postMessage(engine.move_random());
    //postMessage(engine.move_minimax());
    postMessage(engine.move_alphabeta());
}

