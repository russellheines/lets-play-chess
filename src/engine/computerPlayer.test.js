import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { evaluate, minimax, alphabeta, chooseComputerMove } from './computerPlayer.js';

describe('evaluate()', () => {
  it('returns 0 for the starting position', () => {
    const game = new Chess();
    assert.equal(evaluate(game), 0);
  });

  it('returns positive values when White is ahead and negative when Black is ahead', () => {
    // White has an extra Queen (+9)
    const whiteUpQueen = new Chess('4k3/8/8/8/8/8/8/3QK3 w - - 0 1');
    assert.equal(evaluate(whiteUpQueen), 9);

    // Black has an extra Rook (-5)
    const blackUpRook = new Chess('3rk3/8/8/8/8/8/8/4K3 w - - 0 1');
    assert.equal(evaluate(blackUpRook), -5);
  });
});

describe('minimax() vs alphabeta() equivalence', () => {
  const testFens = [
    // Opening position
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    // Tactical middlegame
    'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4',
    // Endgame
    '8/5pk1/6p1/8/3R4/6P1/5PK1/3r4 w - - 0 1',
  ];

  for (const fen of testFens) {
    it(`produces identical scores and fewer evaluations for FEN: ${fen}`, () => {
      const gameA = new Chess(fen);
      const gameB = new Chess(fen);
      const isWhite = gameA.turn() === 'w';

      const mm = minimax(gameA, 3, 3, isWhite);
      const ab = alphabeta(gameB, 3, 3, isWhite, -Infinity, Infinity);

      assert.equal(ab.score, mm.score, 'Alpha-beta score must match minimax score');
      assert.ok(
        ab.evaluations <= mm.evaluations,
        `Expected alphabeta (${ab.evaluations}) <= minimax (${mm.evaluations})`
      );
      // Verify neither search corrupted the board state
      assert.equal(gameA.fen(), fen);
      assert.equal(gameB.fen(), fen);
    });
  }
});

describe('Tactical puzzles & chooseComputerMove()', () => {
  it('captures an undefended Queen', () => {
    // White rook on d1 can capture undefended Black queen on d5
    const fen = '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1';
    const move = chooseComputerMove(fen);
    assert.equal(move.from, 'd1');
    assert.equal(move.to, 'd5');
  });

  it('avoids hanging its own Queen', () => {
    // White queen on d5 is attacked by Black pawn on c6; White must move it away
    const fen = '4k3/8/2p5/3Q4/8/8/8/4K3 w - - 0 1';
    const move = chooseComputerMove(fen);
    assert.equal(move.from, 'd5');
    assert.notEqual(move.to, 'c6'); // Should not trade Queen for a Pawn
  });

  it('returns null when the game is over (checkmate or stalemate)', () => {
    // Fool's mate (Black checkmated White)
    const checkmateFen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
    assert.equal(chooseComputerMove(checkmateFen), null);

    // Stalemate
    const stalemateFen = '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1';
    assert.equal(chooseComputerMove(stalemateFen), null);
  });
});
