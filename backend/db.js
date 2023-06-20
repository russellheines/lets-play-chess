const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
	projectId: 'getting-started-337714',
});

module.exports = db;