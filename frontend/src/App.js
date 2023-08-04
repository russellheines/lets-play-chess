import React, { useEffect, useState, useReducer } from 'react';

import { initialState, reducer } from "./reducers/reducers";
import { validateSelection, validateMove } from "./utils/utils";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Play from './components/Play';

import { io } from 'socket.io-client';

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
			dispatch({type: "accepted", color: color});
		});

		socket.on("pgn", pgn => {
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