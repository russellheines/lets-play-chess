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

function App() {

	const [username, setUsername] = useState(undefined);

	useEffect(() => {
		fetch('/isAuthenticated', {credentials: "include"})
		.then(res => res.json())
		.then(data => setUsername(data.name ? data.name : null));
	}, []);

	function rejectDelay(reason) {
		return new Promise(function(resolve, reject) {
			setTimeout(reject.bind(null, reason), 1000); 
		});
	}

	function connect(socket) {
		const s = socket.connect();
	
		if (s.connected) {
		  return "success";
		} else {
		  throw Error("failed to connect");
		}
	}

	function connectWithRetries(socket) {
		var p = Promise.reject();
		
		for(var i=0; i<10; i++) {
			p = p.catch(() => connect(socket)).catch(rejectDelay);
		}
		return p;
	}
	
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {

		socket.on('connect', () => {
			console.log("connected!");
		});

		socket.on('disconnect', () => {
			console.log("disconnected!");
			if (state.isActive === true) {
				connectWithRetries(socket)
				.catch(err => {
					console.log(err);
				});
			}
			else {
				console.log("not attempting to reconnect");
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
	}, [state.isActive]);  // TODO: useCallback for connectWithRetries

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