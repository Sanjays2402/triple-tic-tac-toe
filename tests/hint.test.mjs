import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMove, initialState } from '../src/game/engine.ts';
import { chooseMove } from '../src/game/ai.ts';

// The hint feature calls chooseMove(state, state.current, opponent, 'hard'),
// so the AI doubles as the hint engine. These tests pin down the behavior the
// hint button relies on.

test('hint suggestion is always a legal, empty cell', () => {
  let state = initialState();
  for (const index of [0, 4, 2, 5, 3]) state = applyMove(state, index);
  for (let round = 0; round < 6; round++) {
    const me = state.current;
    const opp = me === 'X' ? 'O' : 'X';
    const move = chooseMove(state, me, opp, 'hard');
    assert.ok(Number.isInteger(move) && move >= 0 && move < 9, 'move in range');
    assert.equal(state.board[move], null, 'suggested cell is empty');
    state = applyMove(state, move);
    if (state.winner) break;
  }
});

test('hint takes an immediate winning move when one exists', () => {
  // X: 0, 1 placed; O: 3, 4 placed; X to move -> winning cell is 2.
  let state = initialState();
  for (const index of [0, 3, 1, 4]) state = applyMove(state, index);
  assert.equal(state.current, 'X');
  assert.equal(chooseMove(state, 'X', 'O', 'hard'), 2);
});

test("hint blocks the opponent's immediate win", () => {
  // X: 6, 3 placed; O: 0, 2 placed; X to move -> O threatens the top row,
  // so the hint must block at 1 (X has no immediate win of its own).
  let state = initialState();
  for (const index of [6, 0, 3, 2]) state = applyMove(state, index);
  assert.equal(state.current, 'X');
  assert.equal(chooseMove(state, 'X', 'O', 'hard'), 1);
});
