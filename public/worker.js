importScripts("https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js");

onmessage = e => {
    //console.log("working...");

    const engine = new Engine(e.data);
    //postMessage(engine.move_random());
    postMessage(engine.move());
}

class Engine {

    constructor(fen) {
        this.chessjs = new Chess(fen);
    }

    evaluate(color) {
        const values = {'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9};

        const fen = this.chessjs.fen();

        let value = 0;
        for (let i=0; i<fen.indexOf(" "); i++) {
            if (values[fen.charAt(i)]) {
                value += values[fen.charAt(i)];
            }
        }

        return color === 0 ? value : -value;
    }

    minimax_root(initialDepth, color) {
        return this.minimax(initialDepth, initialDepth, color);
    }
    
    minimax(initialDepth, currentDepth, color) {
        let best = [];

        if (currentDepth === 0) {
            let score = this.evaluate(color);
            return {score: score, best: best};
        }

        const moves = this.chessjs.moves({verbose: true});

        let max = -999;
        for (let i=0; i < moves.length; i++) {
            this.chessjs.move(moves[i]);
            let minimax = this.minimax(initialDepth, currentDepth-1, (color+1)%2);
            let score = -minimax.score;
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

    move() {
        let minimax = this.minimax_root(2, this.chessjs.turn() === 'w' ? 0 : 1);
        let best = minimax.best[Math.floor(Math.random() * minimax.best.length)];;
        
        this.chessjs.move({from: best.from, to: best.to, promotion: best.promotion});
        const fen = this.chessjs.fen();

        return {fen: fen, from: best.from, to: best.to, san: best.san};
    }
}

