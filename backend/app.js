require('dotenv').config();

const express = require('express');
const app = express();
const session = require('express-session');
const sessionStore = require('./sessionStore');

const httpServer = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);

const path = require('path');

app.enable("trust proxy");

const sessionMiddleware = session({
    store: sessionStore,
    secret: "changeme",
    resave: false,
    saveUninitialized: true
});
app.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.engine.use(sessionMiddleware);

const socketHandler = require("./socketHandler");
io.on("connection", socket => {
    socketHandler(socket);
});

const port = parseInt(process.env.PORT) || 3001;
httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
})