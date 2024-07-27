import { Chess } from 'chess.js';
import { evaluate, minimax, alphabeta } from './worker.js';

// evaluate

test('at initial position, evaluation returns zero', () => {
  const chessjs = new Chess();
  expect(evaluate(chessjs)).toBe(0);
});

test('if white captures a pawn, evaluation function returns 1', () => {
  const chessjs = new Chess("rnbqkbnr/pppp1ppp/8/4P3/8/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1");
  expect(evaluate(chessjs)).toBe(1);
});

test('if black captures a pawn, evaluation function returns -1', () => {
  const chessjs = new Chess("rnbqkbnr/pppp1ppp/8/8/3p4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1");
  expect(evaluate(chessjs)).toBe(-1);
});

// minimax

test('at initial position, all 20 possible moves are equal', () => {
  const chessjs = new Chess();

  const result = minimax(chessjs, 2, 2, true);
  expect(result.score).toBe(0);
  expect(result.best.length).toBe(20);
});

test('white can capture a hanging pawn', () => {
  const chessjs = new Chess("rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1");

  const result = minimax(chessjs, 2, 2, true);
  expect(result.score).toBe(1);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("dxe5");
});

test('white can capture a pawn, but would lose a knight', () => {
  const chessjs = new Chess("rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1");

  const result = minimax(chessjs, 2, 2, true);
  expect(result.score).toBe(0);
  expect(result.best.length).toBe(18);
  expect(result.best[0].san).not.toBe("dxe5"); // need to check all 18
});

test('lichess - absolute pin #1', () => {
  const chessjs = new Chess("7k/8/8/4n3/4P3/8/8/6BK w KQkq - 0 1");

  const result = minimax(chessjs, 3, 3, true);
  expect(result.score).toBe(4);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Bd4"); // only if depth >= 3
});

test('lichess - absolute pin #2', () => {
  const chessjs = new Chess("5k2/p1p2pp1/7p/2r5/8/1P3P2/PBP3PP/1K6 w KQkq - 0 1");

  const result = minimax(chessjs, 3, 3, true);
  expect(result.score).toBe(4);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Ba3"); // only if depth >= 3
});

test('lichess - knight fork #1', () => {
  const chessjs = new Chess("2q3k1/8/8/5N2/6P1/7K/8/8 w KQkq - 0 1");

  const result = minimax(chessjs, 3, 3, true);
  expect(result.score).toBe(4);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Ne7+"); // only if depth >= 3
});

// too slow???
//test('lichess - knight fork #2', () => {
//});

// alphabeta

test('at initial position, all 20 possible moves are equal', () => {
  const chessjs = new Chess();

  const result = alphabeta(chessjs, 2, 2, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(0);
  //expect(result.best.length).toBe(20);
  expect(result.best.length).toBe(1);
});

test('white can capture a hanging pawn', () => {
  const chessjs = new Chess("rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1");

  const result = alphabeta(chessjs, 2, 2, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(1);
  //expect(result.best.length).toBe(1);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("dxe5");
});

test('white can capture a pawn, but would lose a knight', () => {
  const chessjs = new Chess("rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1");

  const result = alphabeta(chessjs, 2, 2, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(0);
  //expect(result.best.length).toBe(18);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).not.toBe("dxe5"); // need to check all 18
});

test('lichess - absolute pin #1', () => {
  const chessjs = new Chess("7k/8/8/4n3/4P3/8/8/6BK w KQkq - 0 1");

  const result = alphabeta(chessjs, 3, 3, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(4);
  //expect(result.best.length).toBe(1);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Bd4"); // only if depth >= 3
});

test('lichess - absolute pin #2', () => {
  const chessjs = new Chess("5k2/p1p2pp1/7p/2r5/8/1P3P2/PBP3PP/1K6 w KQkq - 0 1");

  const result = alphabeta(chessjs, 3, 3, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(4);
  //expect(result.best.length).toBe(1);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Ba3"); // only if depth >= 3
});

test('lichess - knight fork #1', () => {
  const chessjs = new Chess("2q3k1/8/8/5N2/6P1/7K/8/8 w KQkq - 0 1");

  const result = alphabeta(chessjs, 3, 3, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(4);
  //expect(result.best.length).toBe(1);
  expect(result.best.length).toBe(1);
  expect(result.best[0].san).toBe("Ne7+"); // only if depth >= 3
});

test('lichess - knight fork #2', () => {
  const chessjs = new Chess("6k1/5r1p/p2N4/nppP2q1/2P5/1P2N3/PQ5P/7K w KQkq - 0 1");

  const result = alphabeta(chessjs, 4, 4, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
  expect(result.score).toBe(0);
  expect(result.best[0].san).toBe("Nxf7"); // 4 w/o quiesent search
  //expect(result.score).toBe(0);
  //expect(result.best[0].san).toBe("Qh8+"); // 4 w/o quiesent search
});