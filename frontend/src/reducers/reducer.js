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
    numberOfPlayers: 1, // used rending modal and for determine whether or not to trigger a computer move
    chooseSide: false,
    youWon: false,
    youLost: false,
    waitingForAccept: false,
    challengeId: null
};

export function reducer(state, action) {
    if (action.type === 'reset') {  // TODO: rename to 'reload'?
        return {
            ...initialState,
            orientation: action.color,
            color: action.color
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
            waitingForAccept: true,
            challengeId: action.challengeId
        };
    }
    else if (action.type === 'accepted') {
        return {
            ...initialState,
            orientation: action.color,
            color: action.color,
            numberOfPlayers: 2
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
    else if (action.type === 'position') {

        // e2 = row 7, col 4
        const lastFrom = action.lastMove ? { row: (8 - action.lastMove.from[1]), col: (action.lastMove.from[0].charCodeAt() - 97) } : null;
        const lastTo = action.lastMove ? { row: (8 - action.lastMove.to[1]), col: (action.lastMove.to[0].charCodeAt() - 97) } : null;

        const chessjs = new Chess(action.fen);

        let inCheck = -1;
        if (chessjs.inCheck()) {
            inCheck = chessjs.turn() === 'w' ? WHITE : BLACK;
        }

        // TODO: use just one modal flag and have the modal use inCheckmate?

        let youWon;
        let youLost;
        if (chessjs.isCheckmate()) {
            youWon = ((state.color === WHITE && chessjs.turn() === 'b') || (state.color === BLACK && chessjs.turn() === 'w'));
            youLost = ((state.color === WHITE && chessjs.turn() === 'w') || (state.color === BLACK && chessjs.turn() === 'b'));
        }

        return {
            ...state,
            time: state.time + 1,
            fen: [...state.fen, action.fen],
            selected: null,
            lastFrom: [...state.lastFrom, lastFrom],
            lastTo: [...state.lastTo, lastTo],
            moves: action.lastMove ? [...state.moves, action.lastMove.san] : [...state.moves],
            inCheck: [...state.inCheck, inCheck],
            youWon: youWon,
            youLost: youLost
        };	
    }
    else if (action.type === 'select') {
        return {
            ...state,
            selected: {row: action.row, col: action.col}
        };	
    }
    else if (action.type === 'clearSelection') {
        return {
            ...state,
            selected: null
        };	
    }
    else {
        throw Error('Unknown action: ' + action.type);
    }
}

