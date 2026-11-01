import assert from 'node:assert/strict';
import test from 'node:test';
import { getWalkDuration } from '../src/game/cats/animationTiming.js';

test('walk duration keeps the sprite at a steady pace as distance grows', () => {
  assert.equal(getWalkDuration(190), 1000);
  assert.equal(getWalkDuration(380), 2000);
});

test('walk duration avoids imperceptibly short and overly long walks', () => {
  assert.equal(getWalkDuration(0), 650);
  assert.equal(getWalkDuration(10000), 3600);
});

test('walk duration handles invalid distances safely', () => {
  assert.equal(getWalkDuration(Number.NaN), 650);
  assert.equal(getWalkDuration(Number.POSITIVE_INFINITY), 650);
});
