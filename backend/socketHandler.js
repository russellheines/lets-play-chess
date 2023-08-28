const crypto = require('crypto');

const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');

const { Chess } = require('chess.js');

const firestore = new Firestore();
const pubsub = new PubSub();

// listen for changes to a game and emit events to the given socket

function listen(req, socket) {
    const query = firestore.collection("lets-play-chess").where("gameId", "==", req.session.gameId).orderBy('timestamp');
    const unsubscribe = query.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                socket.emit('pgn', change.doc.data().pgn, req.session.color, req.session.numberOfPlayers);
            }
            else if (change.type === 'modified') {
                socket.emit('pgn', change.doc.data().pgn, req.session.color, req.session.numberOfPlayers);
            }
        });
    });

    return unsubscribe;
}

// listen for acceptance of a challenge and emit an event to the client

function listenChallenges(req, socket) {
    console.log("in listenChallenges");
    console.log("req.session.gameId=" + req.session.gameId);
    const query = firestore.collection('lets-play-challenges').where("gameId", "==", req.session.gameId).orderBy('timestamp');
    const unsubscribe = query.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            console.log("in onSnapshot");
            console.log("req.session.gameId=" + req.session.gameId);
            if ((change.type === 'modified') && (change.doc.data().accepted === true)) {
                socket.emit('accepted', req.session.color);
            }
        });
    });

    return unsubscribe;
}

// publish a message which will trigger the computer to make a move

function computerMove(req) {

    // send the computer's color, as a way to make sure it doesn't try to make two moves if the message is processed
    // more than once
    const computerColor = req.session.color == 0 ? 1 : 0
    const data = JSON.stringify({gameId: req.session.gameId, color: computerColor});

    try {
        pubsub.topic("alphabeta-topic").publishMessage({data: Buffer.from(data)});
    }
    catch (error) {
        console.error(`error publishing message: ${error.message}`);
    }
}

module.exports = socket => {
    console.log('user connected');
    const req = socket.request;

    let detachListener = () => {};
    let detachListenerChallenges = () => {};

    req.session.reload((err) => {
        if (err) {
            console.log("error reloading session: " + err);
        }
    });
    console.log('req.session.gameId: ' + req.session.gameId);
    console.log('req.session.color: ' + req.session.color);
    console.log('req.session.numberOfPlayers: ' + req.session.numberOfPlayers);
      
    if (req.session.gameId) {
        socket.emit('reload');  // sets isActive = false
        detachListener = listen(req, socket);

        firestore.collection("lets-play-challenges").where("gameId", "==", req.session.gameId).get()
            .then(query => {
                if (query.docs.length > 0) {
                    const doc = query.docs[0];
                    const accepted = doc.data().accepted;
                    const challengingColor = doc.data().challengingColor;
                    const challengeId = doc.data().challengeId;

                    if ((!accepted) && (challengingColor === req.session.color)) {
                        detachListenerChallenges = listenChallenges(req, socket);
                        socket.emit('waiting', challengeId);
                    }
                }
            });
    }

    socket.on('start', color => {
        req.session.gameId = crypto.randomUUID();
        req.session.color = color;
        req.session.numberOfPlayers = 1;
        req.session.save();
        console.log('starting game ' + req.session.gameId + ', playing as ' + color);
        detachListener = listen(req, socket);

        const chessjs = new Chess();        
        firestore.collection('lets-play-chess').doc(req.session.gameId).set({
            gameId: req.session.gameId,
            timestamp: Firestore.Timestamp.fromDate(new Date()),
            pgn: chessjs.pgn()
        })
        .then(() => {
            if (color === 1) {
                setTimeout(() => computerMove(req), 100);
            }
        });
    });

    socket.on('position', position => {
        if (!req.session.gameId) {
            console.log("no req.session.gameId!");
            return;
        }

        docRef = firestore.collection("lets-play-chess").doc(req.session.gameId);
        docRef.get()
        .then((doc) => {
            if (doc.exists) {
                const chessjs = new Chess();
                chessjs.loadPgn(doc.data().pgn);

                // check the color, as a way to make sure we don't try to make two moves if the message is processed
                // more than once
                if (((chessjs.turn() === 'w') && (req.session.color === 0)) || ((chessjs.turn() === 'b') && (req.session.color === 1))) {
                    chessjs.move(position.lastMove);

                    docRef.update({ pgn: chessjs.pgn()})
                    .then(() => {
                        if (req.session.numberOfPlayers === 1) {
                            setTimeout(() => computerMove(req), 100);  // will exit early if in checkmate or stalemate, or wrong color
                        }
                    });
                }
                else {
                    console.log("wrong color!");
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
        detachListenerChallenges = listenChallenges(req, socket);

        const challengeId = req.session.gameId.substring(0,8);

        firestore.collection('lets-play-challenges').add({
            gameId: req.session.gameId,
            challengeId: challengeId,
            challengingColor: color,
            acceptingColor: color === 1 ? 0 : 1,
            accepted: false,
            timestamp: Firestore.Timestamp.fromDate(new Date())
        });

        socket.emit('waiting', challengeId);

        detachListener = listen(req, socket);
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

                detachListener = listen(req, socket);

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