const { Firestore } = require('@google-cloud/firestore');
const { FirestoreStore } = require('@google-cloud/connect-firestore');

const sessionStore = new FirestoreStore({
    dataset: new Firestore(),
    kind: 'express-sessions',
});

module.exports = sessionStore;