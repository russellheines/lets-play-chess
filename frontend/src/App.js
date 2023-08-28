import React, { useEffect, useState, useReducer } from 'react';

import { initialState, reducer } from "./reducers/reducers";
import { validateSelection, validateMove } from "./utils/utils";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Play from './components/Play';

import { io } from 'socket.io-client';

const socket = io({
	reconnection: false
});

function reconnect(socket, attemptsRemaining=10) {
	const s = socket.connect();
	if ((s.connected) || (attemptsRemaining <= 0)){
		return;
	}
	setTimeout(() => { reconnect(socket, attemptsRemaining-1) }, 1000);
}

function App() {

	const [username, setUsername] = useState(undefined);

	useEffect(() => {
		fetch('/isAuthenticated', {credentials: "include"})
		.then(res => res.json())
		.then(data => setUsername(data.name ? data.name : null));
	}, []);
	
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {

		socket.on('connect', () => {
			console.log("connected!");

			dispatch({type: "connected"});
		});

		socket.on('disconnect', () => {
			console.log("disconnected!");

			dispatch({type: "disconnected"});
			if (state.isActive) {
				reconnect(socket);
			}
			else {
				console.log("not attempting to reconnect!");
			}
		});

		socket.on("waiting", challengeId => {
			dispatch({type: "waiting", challengeId: challengeId});
		});

		socket.on("accepted", color => {
			dispatch({type: "accepted", color: color});
		});

		socket.on("pgn", (pgn, color, numberOfPlayers) => {
			dispatch({type: "pgn", pgn: pgn, color: color, numberOfPlayers: numberOfPlayers});
		});

		socket.on("reload", () => {
			dispatch({type: "reload"});  // set isActive = false
		});

		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('waiting');
			socket.off('accepted');
			socket.off('pgn');
			socket.off('reload');
		};
	}, [state.isActive]);  // TODO: useCallback for reconnect

	function handleClickSquare(row, col) {
		//console.log("clicked row: " + row + ", col:" + col);
		if (validateSelection(state, row, col)) {
			dispatch({type: "select", row: row, col: col});
		}
		else {
			const move = validateMove(state, row, col);
			if (move) {
				socket.emit("position", { "lastMove" : move });
			}
		}
	}

	function handleOnePlayer() {
		dispatch({type: "onePlayer"});
	}

	function handleTwoPlayers() {
		dispatch({type: "twoPlayers"});
	}

	function handleNewGame() {
		dispatch({type: "new"});
	}

	function handlePlayAs(color) {
		socket.emit("start", color);
	}

	function handleChallenge(color) {
		if (!socket.connected) {
			socket.connect();
		}
		socket.emit("challenge", color);
	}
		
	function handleAccept(gameId) {
		if (!socket.connected) {
			socket.connect();
		}
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