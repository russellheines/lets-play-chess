import React, { useEffect, useState, useReducer } from 'react';

import { initialState, reducer } from "./reducers/reducer";
import { getSquare } from "./utils/utils";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Play from './components/Play';

import { Chess } from 'chess.js';

import { io } from 'socket.io-client';

const WHITE = 0;
const BLACK = 1;

const socket = io({
	withCredentials: true,
});

function App() {

	const [username, setUsername] = useState(undefined);

	useEffect(() => {
		fetch('/isAuthenticated', {credentials: "include"})
		.then(res => res.json())
		.then(data => setUsername(data.name ? data.name : null));
	}, []);

	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		socket.on("waiting", challengeId => {
			dispatch({type: "waiting", challengeId: challengeId});
		});

		socket.on("accepted", color => {
			console.log("accepted, color=" + color);
			dispatch({type: "accepted", color: color});
		});

		socket.on("pgn", pgn => {
			console.log("pgn=" + pgn);
			dispatch({type: "pgn", pgn: pgn});
		});

		socket.on("reload", (color, numberOfPlayers) => {
			dispatch({type: "reload", color: color, numberOfPlayers: numberOfPlayers});
		});

		return () => {
			socket.off('waiting');
			socket.off('accepted');
			socket.off('pgn');
			socket.off('reload');
		};
	}, []);

	function handleClickSquare(row, col) {

		if (state.time < 0) {
			return;
		}

		const sq = getSquare(row, col);
		//console.log("row=" + row + ", col=" + col, "sq=" + sq);

    	const chessjs = new Chess(state.fen[state.time]);
		
		if (state.selected === null) {
			
			// return if not at the current time
			if (state.time !== state.fen.length - 1) {
				return;
			}

			// return if there is no piece, or not that color's turn
			if ((chessjs.get(sq) === null) || (chessjs.get(sq).color !== chessjs.turn())) {
				return;
			}

			// return if playing as white and color is not white
			if ((state.color === WHITE) && (chessjs.get(sq).color !== 'w')) {
				return;
			}

			// return if playing as black and color is not black
			if ((state.color === BLACK) && (chessjs.get(sq).color !== 'b')) {
				return;
			}

			dispatch({type: "select", row: row, col: col});
		}
		else if ((state.selected.row === row) && (state.selected.col === col)) {
			dispatch({type: "clearSelection"});
		}
		else {
			let from = getSquare(state.selected.row, state.selected.col);
			let to = getSquare(row, col);
			console.log("from=" + from + ", to=" + to);

			try {
				let move = null;
				if (((chessjs.get(from).type === 'p') && (chessjs.get(from).color === 'w') && (row === 0)) ||
					((chessjs.get(from).type === 'p') && (chessjs.get(from).color === 'b') && (row === 7))) {
					move = chessjs.move({ from: from, to: to, promotion: 'q' });
				}
				else {
					move = chessjs.move({ from: from, to: to });
				}

				//setFen(fen => [...fen, chessjs.fen()]);
				//setMoves(moves => [...moves, move.san]);
				//setTime(t => t + 1);
				
				socket.emit("position", { "fen" : chessjs.fen(), "lastMove" : move });
			}
			catch (err) {
				console.log(err);
			}
		}
	}

	function handleOnePlayer() {
		fetch("/clear");
		dispatch({type: "onePlayer"});
	}

	function handleTwoPlayers() {
		fetch("/clear");
		dispatch({type: "twoPlayers"});
	}

	function handleNewGame() {
		dispatch({type: "new"});
	}

	function handlePlayAs(color) {
		dispatch({type: "reload", color: color, numberOfPlayers: state.numberOfPlayers});
		socket.emit("start", color);
	}

	function handleChallenge(color) {
		socket.emit("challenge", color);
	}
		
	function handleAccept(gameId) {
		socket.emit("accept", gameId);
	}

	function handleDismissModal() {
		dispatch({type: "dismiss"});
	}

	const layout = <Layout
		name={username}
		handleOnePlayer={handleOnePlayer}
		handleTwoPlayers={handleTwoPlayers}
	/>

	const play = <Play
		state={state}
		dispatch={dispatch}
  
		handleNewGame={handleNewGame}
		handleClickSquare={handleClickSquare}
		handlePlayAs={handlePlayAs}
		handleDismissModal={handleDismissModal}
		handleChallenge={handleChallenge}
		handleAccept={handleAccept}
	/>

	return (
		<BrowserRouter>
			<Routes>
		  		<Route path="/" element={layout}>
					<Route index element={play} />
					<Route path="play" element={play} />
			  	</Route>
			</Routes>
	  	</BrowserRouter>
	);
}

export default App;