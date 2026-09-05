import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyMove, initialState } from '../src/game/engine.ts';

test('invalid cell indices leave the state unchanged', () => {
  const state = initialState();
  for (const index of [-1, 9, 100, 0.5, NaN, Infinity, -Infinity]) {
    assert.equal(applyMove(state, index), state);
  }
  assert.equal(state.board.length, 9);
  assert.deepEqual(state.queues, { X: [], O: [] });
});

test('legal moves remain immutable and occupied cells are rejected', () => {
  const state = initialState();
  const next = applyMove(state, 0);
  assert.equal(state.board[0], null);
  assert.equal(next.board[0], 'X');
  assert.equal(next.current, 'O');
  assert.equal(applyMove(next, 0), next);
});

test('a fourth piece recycles the oldest before evaluating a win', () => {
  let state = initialState();
  for (const index of [0, 1, 2, 3, 4, 7]) state = applyMove(state, index);
  const next = applyMove(state, 6);
  assert.equal(next.board[0], null);
  assert.deepEqual(next.queues.X, [2, 4, 6]);
  assert.equal(next.lastRemoved, 0);
  assert.equal(next.winner, 'X');
  assert.equal(applyMove(next, 8), next);
});
