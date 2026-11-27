import { useEffect, useRef } from 'react';
import './MoveHistory.css';

export default function MoveHistory({
  moves,
  activeMoveIndex,
  onSelectMove,
}) {
  const activeRef = useRef(null);

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1] || '',
      blackIdx: i + 1,
    });
  }

  // Keep the currently selected move scrolled into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeMoveIndex]);

  if (movePairs.length === 0) {
    return <div className="move-history-empty">No moves yet</div>;
  }

  return (
    <div className="move-history" role="log" aria-label="Move history">
      {movePairs.map((pair) => {
        const isWhiteActive = activeMoveIndex === pair.whiteIdx;
        const isBlackActive = activeMoveIndex === pair.blackIdx;

        return (
          <div key={pair.num} className="move-row">
            <span className="move-num">{pair.num}.</span>

            <button
              type="button"
              ref={isWhiteActive ? activeRef : null}
              onClick={() => onSelectMove(pair.whiteIdx)}
              className={`move-cell ${isWhiteActive ? 'latest' : ''}`}
            >
              {pair.white}
            </button>

            {pair.black ? (
              <button
                type="button"
                ref={isBlackActive ? activeRef : null}
                onClick={() => onSelectMove(pair.blackIdx)}
                className={`move-cell ${isBlackActive ? 'latest' : ''}`}
              >
                {pair.black}
              </button>
            ) : (
              <span className="move-cell empty" />
            )}
          </div>
        );
      })}
    </div>
  );
}
