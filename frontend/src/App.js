import React, { useEffect, useState, useReducer } from 'react';

import { initialState, reducer } from "./reducers/reducer";

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
		socket.on("position", position => {
			dispatch({type: "position", fen: position.fen, lastMove: position.lastMove});
		});

		// TODO: maintain numberOfPlayers

		// on reload from session
		socket.on("reset", color => {
			dispatch({type: "reset", color: color});
		});

		socket.on("waiting", gameId => {
			dispatch({type: "waiting", gameId: gameId});
		});

		socket.on("accepted", color => {
			dispatch({type: "accepted", color: color});
		});

		return () => {
			socket.off('position');
			socket.off('reset');
			socket.off('waiting');
			socket.off('accepted');
		};
	}, []);

	function handleClickSquare(row, col) {
		const sq = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
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
			let from = String.fromCharCode(97 + state.selected.col) + (8 - state.selected.row);  // 97 = 'a'
			let to = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
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
				
				socket.emit("position", { "numberOfPlayers": state.numberOfPlayers, "fen" : chessjs.fen(), "lastMove" : move });
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
		dispatch({type: "reset", color: color});
		socket.emit("start", state.numberOfPlayers, color);
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