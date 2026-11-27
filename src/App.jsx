import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';
import './App.css';

function getGameStatus(fen, isViewingPast, playerColor) {
  if (isViewingPast) {
    return 'Viewing past position';
  }

  const game = new Chess(fen);
  const turn = game.turn();
  const isYourTurn = turn === playerColor;

  if (game.isCheckmate()) {
    const winner = turn === 'w' ? 'Black' : 'White';
    return `Checkmate — ${winner} wins`;
  }
  if (game.isDraw()) {
    if (game.isStalemate()) return 'Draw — Stalemate';
    if (game.isThreefoldRepetition()) return 'Draw — Threefold repetition';
    if (game.isInsufficientMaterial()) return 'Draw — Insufficient material';
    return 'Draw';
  }
  if (game.inCheck()) {
    return isYourTurn ? 'Your turn (Check!)' : 'Computer thinking (Check!)';
  }
  return isYourTurn ? 'Your turn' : 'Computer thinking…';
}

function App() {
  const [timeline, setTimeline] = useState(() => [
    { fen: new Chess().fen(), san: null, lastMove: null },
  ]);
  const [viewIndex, setViewIndex] = useState(0);
  const [playerColor, setPlayerColor] = useState('w'); // 'w' or 'b'
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState(false);
  const playMenuRef = useRef(null);

  const isViewingPast = viewIndex < timeline.length - 1;
  const activeEntry = timeline[viewIndex];
  const [, activeTurn = 'w'] = activeEntry.fen.split(' ');
  const moves = timeline.slice(1).map((entry) => entry.san);
  const baseUrl = import.meta.env.BASE_URL;
  const orientation = playerColor === 'w' ? 'white' : 'black';

  const workerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Spin up the Web Worker once on mount and terminate on unmount
  useEffect(() => {
    const worker = new Worker(
      new URL('./engine/computerWorker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { requestId, move } = event.data;
      // Ignore stale responses if the user started a new game or stepped back
      if (requestId !== requestIdRef.current || !move) return;

      setTimeline((prev) => {
        const latestEntry = prev[prev.length - 1];
        const workingGame = new Chess(latestEntry.fen);
        const result = workingGame.move(move);
        if (!result) return prev;

        const next = [
          ...prev,
          {
            fen: workingGame.fen(),
            san: result.san,
            lastMove: { from: result.from, to: result.to },
          },
        ];
        setViewIndex(next.length - 1);
        return next;
      });
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Trigger computer's move via Web Worker whenever it is the computer's turn
  useEffect(() => {
    if (isViewingPast || isResetModalOpen) return;
    if (activeTurn === playerColor) return;

    const workingGame = new Chess(activeEntry.fen);
    if (workingGame.isGameOver()) return;

    const timer = setTimeout(() => {
      requestIdRef.current += 1;
      workerRef.current?.postMessage({
        requestId: requestIdRef.current,
        fen: activeEntry.fen,
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      // Invalidate any in-flight worker computation if dependencies change
      requestIdRef.current += 1;
    };
  }, [activeEntry.fen, activeTurn, playerColor, isViewingPast, isResetModalOpen]);

  // Left / Right arrow keys to step through move history
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isResetModalOpen) {
        setIsResetModalOpen(false);
        return;
      }
      if (isResetModalOpen) return;

      if (e.key === 'ArrowLeft') {
        setViewIndex((idx) => Math.max(0, idx - 1));
      } else if (e.key === 'ArrowRight') {
        setViewIndex((idx) => Math.min(timeline.length - 1, idx + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timeline.length, isResetModalOpen]);

  // Close Play dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleOutsideClick(e) {
      if (playMenuRef.current && !playMenuRef.current.contains(e.target)) {
        setIsPlayMenuOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setIsPlayMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  
  function handleMove(from, to, promotion = 'q') {
    if (activeTurn !== playerColor) return false;

    const workingGame = new Chess(activeEntry.fen);

    try {
      const move = workingGame.move({ from, to, promotion });
      if (move) {
        const nextTimeline = [
          ...timeline.slice(0, viewIndex + 1),
          {
            fen: workingGame.fen(),
            san: move.san,
            lastMove: { from: move.from, to: move.to },
          },
        ];
        setTimeline(nextTimeline);
        setViewIndex(nextTimeline.length - 1);
        return true;
      }
    } catch {
      // Illegal move
    }
    return false;
  }

  function handleSelectMove(moveIndex) {
    setViewIndex(moveIndex + 1);
  }

  function startNewGame(choice) {
    const resolvedColor =
      choice === 'random'
        ? Math.random() < 0.5
          ? 'w'
          : 'b'
        : choice === 'white'
        ? 'w'
        : 'b';

    setPlayerColor(resolvedColor);
    setTimeline([{ fen: new Chess().fen(), san: null, lastMove: null }]);
    setViewIndex(0);
    setIsResetModalOpen(false);
  }

  const statusText = getGameStatus(
    activeEntry.fen,
    isViewingPast,
    playerColor
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          {/* Desktop / iPad: Title */}
          <h1 className="app-title">Let's Play Chess</h1>

          {/* Anchor wrapper so dropdown aligns right under Play (desktop) OR ☰ (iPhone) */}
          <div className="nav-menu" ref={playMenuRef}>
            <button
              type="button"
              className={`nav-trigger desktop-play-btn ${isPlayMenuOpen ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={isPlayMenuOpen}
              onClick={() => setIsPlayMenuOpen((open) => !open)}
            >
              Play <span className="caret">▾</span>
            </button>

            <button
              type="button"
              className={`hamburger-btn ${isPlayMenuOpen ? 'active' : ''}`}
              aria-label="Open menu"
              aria-haspopup="true"
              aria-expanded={isPlayMenuOpen}
              onClick={() => setIsPlayMenuOpen((open) => !open)}
            >
              ☰
            </button>

            {isPlayMenuOpen && (
              <div className="nav-dropdown" role="menu">
                <div className="dropdown-section-label">Play</div>
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item"
                  onClick={() => {
                    setIsPlayMenuOpen(false);
                    setIsResetModalOpen(true);
                  }}
                >
                  New Game
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="board-stage">
          <Board
            position={activeEntry.fen}
            lastMove={activeEntry.lastMove}
            orientation={orientation}
            locked={activeTurn !== playerColor}
            onMove={handleMove}
          />
        </section>

        <aside className="sidebar">
          <div className="panel">
            <div className="panel-header">
              <h2>Game Info</h2>
              <span className="status-badge">{statusText}</span>
            </div>

            <MoveHistory
              moves={moves}
              activeMoveIndex={viewIndex - 1}
              onSelectMove={handleSelectMove}
            />

            <div className="panel-actions">
              <button
                className="reset-btn"
                onClick={() => setViewIndex(0)}
                disabled={viewIndex === 0}
                title="First position"
              >
                ⏮
              </button>
              <button
                className="reset-btn"
                onClick={() => setViewIndex((i) => Math.max(0, i - 1))}
                disabled={viewIndex === 0}
                title="Previous move"
              >
                ◀
              </button>
              <button
                className="reset-btn"
                onClick={() =>
                  setViewIndex((i) => Math.min(timeline.length - 1, i + 1))
                }
                disabled={!isViewingPast}
                title="Next move"
              >
                ▶
              </button>
              <button
                className="reset-btn"
                onClick={() => setViewIndex(timeline.length - 1)}
                disabled={!isViewingPast}
                title="Latest position"
              >
                ⏭
              </button>
            </div>
          </div>
        </aside>
      </main>

      {isResetModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-game-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-game-title">Play as</h2>
            <div className="color-choices">
              <button
                type="button"
                className="color-btn"
                onClick={() => startNewGame('white')}
                title="Play as White"
              >
                <img src={`${baseUrl}pieces/wK.svg`} alt="White" />
                <span>White</span>
              </button>

              <button
                type="button"
                className="color-btn random-btn"
                onClick={() => startNewGame('random')}
                title="Random side"
              >
                <span className="random-icon">?</span>
                <span>Random</span>
              </button>

              <button
                type="button"
                className="color-btn"
                onClick={() => startNewGame('black')}
                title="Play as Black"
              >
                <img src={`${baseUrl}pieces/bK.svg`} alt="Black" />
                <span>Black</span>
              </button>
            </div>

            <button
              type="button"
              className="modal-cancel-btn"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
