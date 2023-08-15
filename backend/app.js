require('dotenv').config();

const express = require('express');
const app = express();
const session = require('express-session');
const sessionStore = require('./sessionStore');

const httpServer = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);

const passport = require('passport');
const authRouter = require('./routes/auth');
const path = require('path');

app.enable("trust proxy");

const sessionMiddleware = session({
  store: sessionStore,
  secret: "changeme",
  resave: false,
  saveUninitialized: true
});
app.use(sessionMiddleware);

app.use(passport.authenticate('session'));
app.use('/', authRouter);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.engine.use(sessionMiddleware);

const registerChessHandlers = require("./chessHandler");
io.on("connection", (socket) => {
  registerChessHandlers(io, socket);
});

const port = parseInt(process.env.PORT) || 3001;
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
})