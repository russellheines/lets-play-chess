const crypto = require('crypto');

const { Firestore } = require('@google-cloud/firestore');

const { Chess } = require('chess.js');

const db = require('./db');

function moveRandomly(fen) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const chessjs = new Chess(fen);

        const allPossibleMoves = chessjs.moves({ verbose: true });
        const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];

        chessjs.move(randomMove);

        resolve({'fen' : chessjs.fen(), 'lastMove' : randomMove});
      }, 1000);
    });
}

module.exports = (io, socket) => {
    console.log('user connected');
    const req = socket.request;

    function unsubscribe() {}

    if (req.session.gameId) {
        console.log('reloading game ' + req.session.gameId);

        socket.emit('reset', req.session.color);

        // listen for changes
        const query = db.collection('one-player-positions').where("gameId", "==", req.session.gameId).orderBy('timestamp');
        unsubscribe = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    socket.emit('position', { 'fen' : change.doc.data().fen, 'lastMove' : change.doc.data().lastMove } );
                }
            });
        });
    }

    socket.on('start', color => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.save();
        console.log('starting game ' + req.session.gameId + ', playing as ' + color);

        // listen for changes
        const query = db.collection('one-player-positions').where("gameId", "==", req.session.gameId).orderBy('timestamp');
        unsubscribe = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    socket.emit('position', { 'fen' : change.doc.data().fen, 'lastMove' : change.doc.data().lastMove } );
                }
            });
        });

        // initial setup
        const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        db.collection('one-player-positions').add({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            fen: initial
        });
    });

    socket.on('position', (position) => {

        db.collection('one-player-positions').add({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            fen: position.fen,
            lastMove: position.lastMove
        });

        const chessjs = new Chess(position.fen);
        if (chessjs.isCheckmate()) {
            return;
        }

        moveRandomly(position.fen).then((p) => {
            db.collection('one-player-positions').add({
                gameId: req.session.gameId,
                timestamp: Firestore.Timestamp.fromDate(new Date()),
                fen: p.fen,
                lastMove: p.lastMove
            });
        });         
    });

    socket.on('computerMove', (position) => {

        moveRandomly(position.fen).then((p) => {
            db.collection('one-player-positions').add({
                gameId: req.session.gameId,
                timestamp: Firestore.Timestamp.fromDate(new Date()),
                fen: p.fen,
                lastMove: p.lastMove
            });
        });         
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');        
        unsubscribe();
    });
}