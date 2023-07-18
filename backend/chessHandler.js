const crypto = require('crypto');

const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');

const { Chess } = require('chess.js');

const firestore = new Firestore();
const pubsub = new PubSub();

module.exports = (io, socket) => {
    console.log('user connected');
    const req = socket.request;

    function unsubscribe() {}
    function subscribe() {
        const query = firestore.collection('lets-play-positions').where("gameId", "==", req.session.gameId).orderBy('timestamp');
        unsubscribe = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                //console.log("snapshot.size: " + snapshot.size)
                //console.log("change.oldIndex: " + change.oldIndex)
                //console.log("change.newIndex: " + change.newIndex)
                if (change.type === 'added') {
                    socket.emit('position', { 'fen' : change.doc.data().fen, 'lastMove' : change.doc.data().lastMove } );
                }
            });
        });
    }

    function unsubscribeChallenges() {}
    function subscribeChallenges() {
        const query = firestore.collection('lets-play-challenges').where("gameId", "==", req.session.gameId).orderBy('timestamp');
        unsubscribeChallenges = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                //console.log("snapshot.size: " + snapshot.size)
                //console.log("change.oldIndex: " + change.oldIndex)
                //console.log("change.newIndex: " + change.newIndex)
                if ((change.type === 'modified') && (change.doc.data().accepted === true)) {
                    socket.emit('accepted', req.session.color);
                }
            });
        });
    }

    function publish(fen) {
        const data = JSON.stringify({gameId: req.session.gameId, fen: fen});
        const dataBuffer = Buffer.from(data);

        try {
            pubsub.topic("random-topic").publishMessage({data: dataBuffer});
        }
        catch (error) {
            console.error(`Received error while publishing: ${error.message}`);
        }
    }

    if (req.session.gameId) {
        console.log('reloading game ' + req.session.gameId);
        socket.emit('reset', req.session.color);
        subscribe();
    }

    socket.on('start', (numberOfPlayers, color) => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.save();
        console.log('starting game ' + req.session.gameId + ', playing as ' + color);
        subscribe();

        const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        firestore.collection('lets-play-positions').add({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            fen: initial
        });

        if ((color === 1) && (numberOfPlayers === 1)) {
            setTimeout(() => publish(initial), 250);
        }
    });

    socket.on('position', (position) => {

        firestore.collection('lets-play-positions').add({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            fen: position.fen,
            lastMove: position.lastMove
        });

        const chessjs = new Chess(position.fen);
        if (chessjs.isCheckmate() || chessjs.isDraw()) {
            return;
        }

        if (position.numberOfPlayers === 1) {
            setTimeout(() => publish(position.fen), 250);
        }
    });

    socket.on('challenge', color => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.save();
        console.log('starting challenge ' + req.session.gameId + ', playing as ' + color);
        subscribeChallenges();

        const challengeId = req.session.gameId.substring(0,8);

        firestore.collection('lets-play-challenges').add({
            gameId: req.session.gameId,
            numberOfPlayers: 2,
            challengeId: challengeId,
            challengingColor: color,
            acceptingColor: color === 1 ? 0 : 1,
            accepted: false,
            timestamp: Firestore.Timestamp.fromDate(new Date())
        });

        socket.emit('waiting', challengeId);

        subscribe();
    });

    socket.on('accept', challengeId => {
        firestore.collection("lets-play-challenges").where("challengeId", "==", challengeId).limit(1).get()
            .then(query => {
                const doc = query.docs[0];
                doc.ref.update({ accepted: true});

                req.session.gameId = doc.data().gameId;
                req.session.color = doc.data().acceptingColor;
                req.session.save();
    
                console.log('accepting challenge ' + challengeId);

                subscribe();

                const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                firestore.collection('lets-play-positions').add({
                    gameId: req.session.gameId,
                    timestamp: Firestore.Timestamp.fromDate(new Date()),
                    fen: initial
                });

                socket.emit('accepted', req.session.color);    
            });        
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');        
        unsubscribe();
        unsubscribeChallenges();
    });
}