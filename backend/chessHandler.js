const crypto = require('crypto');

const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');

const { Chess } = require('chess.js');

const firestore = new Firestore();
const pubsub = new PubSub();

module.exports = (io, socket) => {
    console.log('user connected');
    const req = socket.request;

    function detachListener() {}
    function listen() {
        const query = firestore.collection("lets-play-chess").where("gameId", "==", req.session.gameId).orderBy('timestamp');
        detachListener = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    //console.log('added');
                    socket.emit('pgn', change.doc.data().pgn, req.session.color, req.session.numberOfPlayers);
                }
                else if (change.type === 'modified') {
                    //console.log('modified');
                    socket.emit('pgn', change.doc.data().pgn, req.session.color, req.session.numberOfPlayers);
                }
            });
        });
    }

    function detachListenerChallenges() {}
    function listenChallenges() {
        const query = firestore.collection('lets-play-challenges').where("gameId", "==", req.session.gameId).orderBy('timestamp');
        detachListenerChallenges = query.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if ((change.type === 'modified') && (change.doc.data().accepted === true)) {
                    socket.emit('accepted', req.session.color);
                }
            });
        });
    }

    function computerMove() {
        // send color as part of a sanity check to make sure the computer doesn't make two moves, if the message is
        // processed more than once
        const computerColor = req.session.color == 0 ? 1 : 0;
        const data = JSON.stringify({gameId: req.session.gameId, color: computerColor});

        try {
            pubsub.topic("alphabeta-topic").publishMessage({data: Buffer.from(data)});
        }
        catch (error) {
            console.error(`Received error while publishing: ${error.message}`);
        }
    }

    req.session.reload((err) => {
        if (err) {
            console.log("error reloading session: " + err);
        }
    });
      
    if (req.session.gameId) {
        console.log('reloading game ' + req.session.gameId);
        socket.emit('reload');  // sets isActive = false
        listen();
    }

    socket.on('start', (color) => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.numberOfPlayers = 1;
        req.session.save();
        console.log('starting game ' + req.session.gameId + ', playing as ' + color);
        listen();

        const chessjs = new Chess();        
        firestore.collection('lets-play-chess').doc(req.session.gameId).set({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            pgn: chessjs.pgn()
        })
        .then(() => {
            if (color === 1) {
                setTimeout(() => computerMove(), 100);
            }
        });
    });

    socket.on('position', (position) => {
        if (!req.session.gameId) {
            console.log("No req.session.gameId!");
            return;
        }
        docRef = firestore.collection("lets-play-chess").doc(req.session.gameId);

        docRef.get()
        .then((doc) => {
            if (doc.exists) {
                const chessjs = new Chess();
                chessjs.loadPgn(doc.data().pgn);

                //if ((!(req.session.gameId in dict)) || (dict[req.session.gameId] !== chessjs.moveNumber())) {
                //    dict[req.session.gameId] = chessjs.moveNumber();
                // check color, in case message is processed more than once

                if (((chessjs.turn() === 'w') && (req.session.color === 0)) || ((chessjs.turn() === 'b') && (req.session.color === 1))) {
                    chessjs.move(position.lastMove);

                    docRef.update({ pgn: chessjs.pgn()})
                    .then(() => {
                        if (req.session.numberOfPlayers === 1) {
                            setTimeout(() => computerMove(), 100);  // will exit early if in checkmate or stalemate, or wrong color
                        }
                    });
                }
                else {
                    console.log("Wrong color!");
                    //console.log("Wrong move number!");
                }
            }
        })
    });

    socket.on('challenge', color => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.numberOfPlayers = 2;
        req.session.save();
        console.log('starting challenge ' + req.session.gameId + ', playing as ' + color);
        listenChallenges();

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

        listen();
    });

    socket.on('accept', challengeId => {
        firestore.collection("lets-play-challenges").where("challengeId", "==", challengeId).get()
            .then(query => {
                const doc = query.docs[0];
                doc.ref.update({ accepted: true});

                req.session.gameId = doc.data().gameId;
                req.session.color = doc.data().acceptingColor;
                req.session.numberOfPlayers = 2;
                req.session.save();
    
                console.log('accepting challenge ' + challengeId);

                listen();

                const chessjs = new Chess();        
                firestore.collection('lets-play-chess').doc(req.session.gameId).set({
                    gameId: req.session.gameId,
                    timestamp: Firestore.Timestamp.fromDate(new Date()),
                    pgn: chessjs.pgn()
                });

                socket.emit('accepted', req.session.color);
            });        
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');        
        detachListener();
        detachListenerChallenges();
    });
}