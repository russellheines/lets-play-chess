import React, { useState, useEffect } from 'react';

import { io } from 'socket.io-client';

import { Chess } from 'chess.js';

import LoopIcon from '@mui/icons-material/Loop';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import Board from "./Board";
import History from "./History";
import MyModal from "./Modal";

/*export const socket = io("http://localhost:3001", {
    withCredentials: true,
    autoConnect: false
});
*/

export const socket = io({
    withCredentials: true,
    autoConnect: false
});

function OnePlayer() {
  
	//const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	const [fen, setFen] = useState([]);
	const [time, setTime] = useState(-1);  // initial setup is 0...
	const [orientation, setOrientation] = useState(0);  // oriented for white
	const [playingAs, setPlayingAs] = useState(0);  // playing as white
	const [selected, setSelected] = useState(null);
	const [lastFrom, setLastFrom] = useState([null]);  // no last from at time 0
	const [lastTo, setLastTo] = useState([null]);  // no last to at time 0
	const [moves, setMoves] = useState([]);
	const [inCheck, setInCheck] = useState([]);  // initial setup is -1...
	const [gameOver, setGameOver] = useState(false);
	const [chooseSide, setChooseSide] = useState(false);
	const [youWon, setYouWon] = useState(false);
	const [youLost, setYouLost] = useState(false);

	// https://socket.io/how-to/use-with-react

	useEffect(() => {

		// no-op if the socket is already connected
		socket.connect();
	
		return () => {
		  socket.disconnect();
		};
	}, []);
	  
	useEffect(() => {
		socket.on("position", position => {
			setFen(fen => [...fen, position.fen]);
			setTime(t => t + 1);

			//console.log("position.lastMove=" + position.lastMove);
			if (position.lastMove) {
				//console.log("position.lastMove=" + position.lastMove.from + ", " + position.lastMove.to);
				let from = { row: (8 - position.lastMove.from[1]), col: (position.lastMove.from[0].charCodeAt() - 97) };  // e2 = row 7, col 4
				setLastFrom(lastFrom => [...lastFrom, from]);
	
				let to = { row: (8 - position.lastMove.to[1]), col: (position.lastMove.to[0].charCodeAt() - 97) };  // e2 = row 7, col 4
				setLastTo(lastTo => [...lastTo, to]);
			}

			setSelected(null);

			if (position.lastMove) {
				setMoves(moves => [...moves, position.lastMove.san]);
			}

			const chessjs = new Chess(position.fen);			
			if (chessjs.inCheck()) {
				setInCheck(inCheck => [...inCheck, chessjs.turn() === 'w' ? 0 : 1]);
			}
			else {
				setInCheck(inCheck => [...inCheck, -1]);
			}

			if (chessjs.isCheckmate()) {				
				setGameOver(true);
				setYouWon(((chessjs.turn() === 'w' && playingAs === 0) || (chessjs.turn() === 'b' && playingAs === 1)) ? false : true);
				setYouLost(((chessjs.turn() === 'w' && playingAs === 0) || (chessjs.turn() === 'b' && playingAs === 1)) ? true : false);
			}
		});

		return () => {
			socket.off('position');
		};
	}, [playingAs]);

	function handleClickSquare(row, col) {
		if (gameOver === true) {
			return;
		}

		const sq = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
		//console.log("row=" + row + ", col=" + col, "sq=" + sq);

    	const chessjs = new Chess(fen[time]);
		
		if (selected === null) {
			
			// return if not at the current time
			if (time !== fen.length - 1) {
				return;
			}

			// return if there is no piece, or not that color's turn
			if ((chessjs.get(sq) === null) || (chessjs.get(sq).color !== chessjs.turn())) {
				return;
			}

			// return if playing as white and color is not white
			if ((playingAs === 0) && (chessjs.get(sq).color !== 'w')) {
				return;
			}

			// return if playing as black and color is not black
			if ((playingAs === 1) && (chessjs.get(sq).color !== 'b')) {
				return;
			}

			setSelected({ row: row, col: col });
		}
		else if ((selected.row === row) && (selected.col === col)) {
			setSelected(null);
		}
		else {
			let from = String.fromCharCode(97 + selected.col) + (8 - selected.row);  // 97 = 'a'
			let to = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'

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
			finally {
				setSelected(null);
			}
		}
	}

	function handlePlayAsWhite() {
		setOrientation(0);
		setPlayingAs(0);
		startNewGame();
	}

	function handlePlayAsBlack() {
		setOrientation(1);
		setPlayingAs(1);
		startNewGame();
		const chessjs = new Chess();
		socket.emit("computerMove", { "fen" : chessjs.fen()});
	}

	function handlePlayAsRandom() {
		const random = Math.floor(Math.random() * 2);
		setOrientation(random);
		setPlayingAs(random);
		startNewGame();
		if (random === 1) {
			const chessjs = new Chess();
			socket.emit("computerMove", { "fen" : chessjs.fen()});
		}
	}

	function handleChangeOrientation() {
		setOrientation((orientation + 1) % 2);
	}

	function handleNewGame() {
		setChooseSide(true);
	}

	function startNewGame() {
		setFen([]);
		setTime(-1);
		setLastFrom([null]);
		setLastTo([null]);
		setMoves([]);
		setInCheck([]);
		setGameOver(false);
		setChooseSide(false);
		setYouWon(false);
		setYouLost(false);
		socket.emit("start");
	}
		
	function handleFirst() {
		setTime(0);
		setSelected(null);
	}

	function handlePrevious() {
		setTime(time - 1);
		setSelected(null);
	}

	function handleNext() {
		setTime(time + 1);
		setSelected(null);
	}

	function handleLast() {
		setTime(fen.length - 1);
		setSelected(null);
	}

	function handleClickMove(i) {
		setTime(i + 1);
		setSelected(null);
	}

	return (
		<>
			<div className="main">
				<Board
					fen={fen[time]}
					orientation={orientation}
					selected={selected}
					lastFrom={lastFrom[time]}
					lastTo={lastTo[time]}
					handleClickSquare={handleClickSquare}
					inCheck={inCheck[time]}
				/>
				<History
					moves={moves}
					time={time}
					handleFirst={handleFirst}
					handlePrevious={handlePrevious}
					handleNext={handleNext}
					handleLast={handleLast}
					handleClickMove={handleClickMove}
					handleChangeOrientation={handleChangeOrientation}
					handleNewGame={handleNewGame}
				/>
				<div className="historyBtns portrait" style={{order: 3}}>
					<div className="historyBtn" onClick={handleChangeOrientation}><LoopIcon/></div>
                    <div className="historyBtn" onClick={handleNewGame}><AddIcon/></div>
                    <div className="historyBtn"><MoreHorizIcon/></div>
				</div>
			</div>
			<MyModal
				chooseSide={chooseSide}
				youWon={youWon}
				youLost={youLost}
				handlePlayAsWhite={handlePlayAsWhite}
				handlePlayAsBlack={handlePlayAsBlack}
				handlePlayAsRandom={handlePlayAsRandom}
			/>
		</>
  	);
};

export default OnePlayer;