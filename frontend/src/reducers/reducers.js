import { Chess } from 'chess.js';

const WHITE = 0;
const BLACK = 1;

export const initialState = {
    time: -1, // initial position will bump to 0
    fen: [],
    selected: null,
    lastFrom: [],
    lastTo: [],
    moves: [], // TODO: rename to 'san'?
    inCheck: [],
    orientation: WHITE,
    color: WHITE, // used for validating moves and determining if checkmate is a win or a loss, not used by child components
    numberOfPlayers: 1, // used rendering modal and for determining whether or not to trigger a computer move
    chooseSide: false,
    youWon: false,
    youLost: false,
    waitingForAccept: false,
    challengeId: null,
    isActive: false, // TODO: remove, use isConnected to notify the user (?)
    isConnected: true
};

export function reducer(state, action) {
    if (action.type === 'reload') {
        return {
            ...state,
            isActive: false
        };
    }
    else if (action.type === 'connected') {
        return {
            ...state,
            isConnected: true
        };
    }
    else if (action.type === 'disconnected') {
        return {
            ...state,
            isConnected: false
        };
    }
    else if (action.type === 'onePlayer') {
        return {
            ...initialState,
            numberOfPlayers: 1,
            chooseSide: true
        };
    }
    else if (action.type === 'twoPlayers') {
        return {
            ...initialState,
            numberOfPlayers: 2,
            chooseSide: true
        };
    }
    else if (action.type === 'new') {
        return {
            ...state,
            chooseSide: true
        };
    }
    else if (action.type === 'waiting') {
        return {
            ...state,
            chooseSide: false,
            numberOfPlayers: 2,
            waitingForAccept: true,
            challengeId: action.challengeId
        };
    }
    else if (action.type === 'accepted') {
        return {
            ...state,
            waitingForAccept: false,
            orientation: action.color,
            color: action.color,
        };
    }
    else if (action.type === 'dismiss') {
        return {
            ...state,
            chooseSide: false,
            youWon: false,
            youLost: false,
            waitingForAccept: false
        };
    }
    else if (action.type === 'orientation') {
        return {
            ...state,
            orientation: state.orientation !== WHITE ? WHITE : BLACK
        };
    }
    else if (action.type === 'first') {
        return {
            ...state,
            time: 0,
            selected: null
          };	
    }
    else if (action.type === 'previous') {
        return {
            ...state,
            time: state.time - 1,
            selected: null
        };	
    }
    else if (action.type === 'next') {
        return {
            ...state,
            time: state.time + 1,
            selected: null
        };	
    }
    else if (action.type === 'last') {
        return {
            ...state,
            time: state.fen.length - 1,
            selected: null
        };	
    }
    else if (action.type === 'index') {
        return {
            ...state,
            time: action.index + 1,
            selected: null
        };	
    }
    else if (action.type === 'pgn') {
        const chessjs = new Chess();
        const fen = [chessjs.fen()];
        const moves = [];
        const lastFrom = [null];
        const lastTo = [null];
        const inCheck = [-1];

        chessjs.loadPgn(action.pgn)

        if (chessjs.fen() === state.fen[state.fen.length - 1]) {
            //console.log("no changes, leaving isActive: " + state.isActive);
            return {
                ...state,  // nothing changed...
            };
        }
        //console.log("changes, leaving isActive: true");

        const history = chessjs.history({verbose: true});

        for (let i=0; i<history.length; i++) {
            fen.push(history[i].after);
            moves.push(history[i].san);

            // e2 = row 7, col 4
            const from = { row: (8 - history[i].from[1]), col: (history[i].from[0].charCodeAt() - 97) };
            const to = { row: (8 - history[i].to[1]), col: (history[i].to[0].charCodeAt() - 97) };
            lastFrom.push(from);
            lastTo.push(to);

            if ((history[i].san.endsWith("+")) || (history[i].san.endsWith("#"))) {
                inCheck.push(history[i].color === 'w' ? BLACK : WHITE);
            }
            else {
                inCheck.push(-1);
            }
        }

        let youWon = false;
        let youLost = false;
        if (history.length > 0) {
            const lastMove = history[history.length-1];
            if (lastMove.san.endsWith("#")) {
                youWon = (state.color === WHITE && lastMove.color === 'w') || (state.color === BLACK && lastMove.color === 'b');
                youLost = (state.color === WHITE && lastMove.color === 'b') || (state.color === BLACK && lastMove.color === 'w');
            }
        }

        return {
            ...initialState,
            orientation: action.color,
            color: action.color,
            numberOfPlayers: action.numberOfPlayers,
            time: history.length,
            fen: fen,
            selected: null,
            lastFrom: lastFrom,
            lastTo: lastTo,
            moves: moves,
            inCheck: inCheck,
            youWon: youWon,
            youLost: youLost,
            isActive: true
        }
    }
    else if (action.type === 'select') {
        let selected = {row: action.row, col: action.col};
        if ((state.selected) && (state.selected.row === action.row) && (state.selected.col === action.col)) {
            selected = null;
        }

        return {
            ...state,
            selected: selected
        };	
    }
    else {
        throw Error('Unknown action: ' + action.type);
    }
}

