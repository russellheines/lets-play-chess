import { useState, useEffect } from 'react';

import { Chess } from 'chess.js';

import Board from "./components/Board";
import Panel from "./components/Panel";
import Dialog from "./components/Dialog";

const WHITE = 0;
const BLACK = 1;

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function App() {

  const [fen, setFen] = useState([INITIAL_FEN]);
  const [time, setTime] = useState(0);
  const [selected, setSelected] = useState(null);
  const [lastFrom, setLastFrom] = useState([null]);
  const [lastTo, setLastTo] = useState([null]);
  const [inCheck, setInCheck] = useState([null]);
  const [history, setHistory] = useState([]);
  const [orientation, setOrientation] = useState(WHITE);
  const [showDialog, setShowDialog] = useState(true);
  const [dialogTitle, setDialogTitle] = useState("Let's play!");
  const [dialogText, setDialogText] = useState("Choose a side:");

  useEffect(() => {
    // create new web worker
    const worker = new Worker('worker.js');

    // set up event listener for messages from the worker
    worker.onmessage = function (event) {
      try {
        updateStateAfterMove(new Chess(event.data.fen), event.data.from, event.data.to, event.data.san);
      }
      catch(err) {
        console.log(err);
      }
    };

    // send a message to the worker
    const chessjs = new Chess(fen[time]);
    if ((!chessjs.isGameOver()) && (((orientation === 0) && (chessjs.turn() === 'b')) || ((orientation === 1) && (chessjs.turn() === 'w'))) &&
      (time === fen.length-1)) {
      setTimeout(() => worker.postMessage(chessjs.fen()), 500);
    }

    // clean up the worker when the component re-renders
    return () => {
      worker.terminate();
    };
  }, [fen, time]); // run this effect after the initial render and after re-renders with changed dependencies

  function handleClickFirst() {
    setTime(0);
  }

  function handleClickPrevious() {
    if (time > 0) {
      setTime(time-1);
    }
  }

  function handleClickNext() {
    if (time < fen.length-1) {
      setTime(time+1);
    }
  }

  function handleClickLast() {
    setTime(fen.length-1);
  }
  
  function handleClickIndex(time) {
    setTime(time);
  }
  
  function reset() {
    setTime(0);
    setFen([INITIAL_FEN]);
    setSelected(null);
    setLastFrom([null]);
    setLastTo([null]);
    setInCheck([null]);
    setHistory([]);
  }

  function handleClickBlack() {
    reset();
    setOrientation(1);
    setShowDialog(false);
  }
  
  function handleClickWhite() {
    reset();
    setOrientation(0);
    setShowDialog(false);
  }
  
  function handleClickRandom() {
    reset();
    setOrientation(Math.floor(Math.random() * 2));
    setShowDialog(false);
  }
  
  function handleClickSquare(row, col) {
		//console.log("clicked row: " + row + ", col:" + col);

    const chessjs = new Chess(fen[time]);

    if (selected === null) {
      if (time < fen.length-1) {
        return;
      }
      const sq = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'
      const piece = chessjs.get(sq);
      if ((piece) && (piece.color === chessjs.turn())) {
        setSelected({row: row, col: col});
      }
    }
    else if ((selected !== null) && (selected.row === row) && (selected.col === col)) {
      setSelected(null);
    }
    else {
      const from = String.fromCharCode(97 + selected.col) + (8 - selected.row);  // 97 = 'a'
      const to = String.fromCharCode(97 + col) + (8 - row);  // 97 = 'a'

      const piece = chessjs.get(from);
      const toRow = 8 - to[1];
      const promotion = ((piece.type === 'p') && ((toRow === 0) || (toRow === 7))) ? "q" : "";

      try {    
        const move = chessjs.move({ from: from, to: to, promotion: promotion });
    
        updateStateAfterMove(chessjs, from, to, move.san);
      }
      catch(err) {
        console.log(err);
      }
  
      setSelected(null);
    }
	}

  function updateStateAfterMove(chessjs, from, to, san) {
    const fromRow = 8 - from[1];
    const fromCol = from.charCodeAt(0) - 97;

    const toRow = 8 - to[1];
    const toCol = to.charCodeAt(0) - 97;

    setTime(time + 1);
    setFen([...fen, chessjs.fen()]);
    setLastFrom([...lastFrom, {row: fromRow, col: fromCol}]);
    setLastTo([...lastTo, {row: toRow, col: toCol}]);
    setHistory([...history, san]);

    if (chessjs.inCheck()) {
      setInCheck([...inCheck, chessjs.turn() === 'w' ? 0 : 1]);
    }
    else {
      setInCheck([...inCheck, null]);
    }

    if (chessjs.isCheckmate()) {
      if (((orientation === 0) && (chessjs.turn() === 'b')) || ((orientation === 1) && (chessjs.turn() === 'w'))) {
        setShowDialog(true);
        setDialogTitle("You won!");
        setDialogText("Choose a side to play again:")
      }
      else {
        setShowDialog(true);
        setDialogTitle("You lost!");
        setDialogText("Choose a side to play again:")
      }
    }

    if (chessjs.isDraw()) {
      setShowDialog(true);
      setDialogTitle("Draw!");
      setDialogText("Choose a side to play again:")
    }
  }

  return (
    <>
      <Panel
        history = {history}
        time = {time}
        handleClickFirst = {handleClickFirst}
        handleClickPrevious = {handleClickPrevious}
        handleClickNext = {handleClickNext}
        handleClickLast = {handleClickLast}
        handleClickIndex = {handleClickIndex}
        />
      <Board
        fen = {fen[time]}        
        selected = {selected}
        lastFrom = {lastFrom[time]}
        lastTo = {lastTo[time]}
        inCheck = {inCheck[time]}
        orientation = {orientation}
        handleClickSquare = {handleClickSquare}
        />
      <Dialog
        showDialog = {showDialog}
        dialogTitle = {dialogTitle}
        dialogText = {dialogText}
        handleClickBlack = {handleClickBlack}
        handleClickWhite = {handleClickWhite}
        handleClickRandom = {handleClickRandom}
        />
    </>
  );
}

export default App;