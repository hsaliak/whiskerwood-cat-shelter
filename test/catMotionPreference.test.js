import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldReduceCatMotion } from '../src/game/cats/motionPreference.js';

test('reduced-motion preference still reduces cat motion on non-touch devices', () => {
  assert.equal(shouldReduceCatMotion(true, false), true);
});

test('cats keep moving on coarse-pointer devices despite reduced-motion preference', () => {
  assert.equal(shouldReduceCatMotion(true, true), false);
});

test('cats keep moving when reduced motion is not requested', () => {
  assert.equal(shouldReduceCatMotion(false, false), false);
  assert.equal(shouldReduceCatMotion(false, true), false);
});
