const crypto = require('crypto');

const { PubSub } = require('@google-cloud/pubsub');
const { Firestore } = require('@google-cloud/firestore');

const { Chess } = require('chess.js');

const db = require('./db');

const pubSubClient = new PubSub();

module.exports = (io, socket) => {
    console.log('user connected');
    const req = socket.request;

    function unsubscribe() {}

    function subscribe() {
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

    function publish(fen) {
        const data = JSON.stringify({gameId: req.session.gameId, fen: fen});
        const dataBuffer = Buffer.from(data);
        console.log(data);

        try {
          const messageId = pubSubClient
            .topic("random-topic")
            .publishMessage({data: dataBuffer});
          console.log(`Message ${messageId} published.`);
        } catch (error) {
          console.error(`Received error while publishing: ${error.message}`);
          process.exitCode = 1;
        }
    }

    if (req.session.gameId) {
        console.log('reloading game ' + req.session.gameId);
        socket.emit('reset', req.session.color);
        subscribe();
    }

    socket.on('start', color => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.save();
        console.log('starting game ' + req.session.gameId + ', playing as ' + color);
        subscribe();

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

        setTimeout(() => publish(position.fen), 250);
    });

    socket.on('computerMove', (position) => {
        setTimeout(() => publish(position.fen), 250);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');        
        unsubscribe();
    });
}