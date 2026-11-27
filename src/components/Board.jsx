import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import './Board.css';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function fenToBoardMap(fen) {
  const [boardPart] = fen.split(' ');
  const rows = boardPart.split('/');
  const map = {};

  rows.forEach((row, rankIndex) => {
    let fileIndex = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        fileIndex += Number(char);
      } else {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const piece = `${color}${char.toUpperCase()}`;
        const square = `${FILES[fileIndex]}${RANKS[rankIndex]}`;
        map[square] = piece;
        fileIndex += 1;
      }
    }
  });

  return map;
}

export default function Board({
  position,
  lastMove = null,
  orientation = 'white',
  locked = false,
  onMove,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    setSelectedSquare(null);
  }, [position]);

  const pieces = useMemo(() => fenToBoardMap(position), [position]);
  const [, activeTurn = 'w'] = position.split(' ');
  const baseUrl = import.meta.env.BASE_URL;

  const displayRanks = useMemo(
    () => (orientation === 'black' ? [...RANKS].reverse() : RANKS),
    [orientation]
  );
  const displayFiles = useMemo(
    () => (orientation === 'black' ? [...FILES].reverse() : FILES),
    [orientation]
  );

  const checkedSquare = useMemo(() => {
    try {
      const tempGame = new Chess(position);
      if (!tempGame.inCheck()) return null;

      const kingKey = `${activeTurn}K`;
      return (
        Object.keys(pieces).find((sq) => pieces[sq] === kingKey) || null
      );
    } catch {
      return null;
    }
  }, [position, pieces, activeTurn]);

  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return new Set();
    try {
      const tempGame = new Chess(position);
      const moves = tempGame.moves({ square: selectedSquare, verbose: true });
      return new Set(moves.map((m) => m.to));
    } catch {
      return new Set();
    }
  }, [position, selectedSquare]);

  function handleSquareClick(squareId) {
    if (locked) return;
    const clickedPiece = pieces[squareId];

    if (selectedSquare === squareId) {
      setSelectedSquare(null);
      return;
    }

    if (clickedPiece && clickedPiece.startsWith(activeTurn)) {
      setSelectedSquare(squareId);
      return;
    }

    if (selectedSquare) {
      onMove?.(selectedSquare, squareId);
      setSelectedSquare(null);
    }
  }

  return (
    <div className="board-wrapper">
      <div className="board" role="grid" aria-label="Chessboard">
        {displayRanks.map((rank, rankIndex) =>
          displayFiles.map((file, fileIndex) => {
            const squareId = `${file}${rank}`;
            // Preserve true algebraic square color regardless of board orientation
            const trueFileIdx = FILES.indexOf(file);
            const trueRankIdx = RANKS.indexOf(rank);
            const isLight = (trueRankIdx + trueFileIdx) % 2 === 0;
            const piece = pieces[squareId];

            const isSelected = selectedSquare === squareId;
            const isLastMove =
              lastMove?.from === squareId || lastMove?.to === squareId;
            const isInCheck = checkedSquare === squareId;
            const isLegalDest = legalDestinations.has(squareId);

            return (
              <div
                key={squareId}
                data-square={squareId}
                onClick={() => handleSquareClick(squareId)}
                className={[
                  'square',
                  isLight ? 'light' : 'dark',
                  isSelected ? 'selected' : '',
                  isLastMove ? 'last-move' : '',
                  isInCheck ? 'in-check' : '',
                  isLegalDest
                    ? piece
                      ? 'dest-capture'
                      : 'dest-move'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {fileIndex === 0 && (
                  <span className="coord coord-rank">{rank}</span>
                )}
                {rankIndex === 7 && (
                  <span className="coord coord-file">{file}</span>
                )}

                {piece && (
                  <img
                    src={`${baseUrl}pieces/${piece}.svg`}
                    alt={piece}
                    className="piece"
                    draggable={false}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
