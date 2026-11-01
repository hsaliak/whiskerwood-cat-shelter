import test from 'node:test';
import assert from 'node:assert/strict';
import { CozyMusic } from '../src/game/audio/cozyMusic.js';

test('background music stays silent until the player starts it', () => {
  const music = new CozyMusic();
  assert.equal(music.playing, false);
  assert.equal(music.context, null);
  assert.equal(music.timer, null);
});

test('disco mode changes tempo and can return to cozy music', () => {
  const originalWindow = globalThis.window;
  const intervals = [];
  const cleared = [];
  globalThis.window = {
    clearInterval: (id) => cleared.push(id),
    setInterval: (callback, delay) => {
      intervals.push({ callback, delay });
      return intervals.length;
    },
  };
  try {
    const music = new CozyMusic();
    music.playing = true;
    music.timer = 'cozy-loop';
    assert.equal(music.setMode('disco'), true);
    assert.equal(music.mode, 'disco');
    assert.equal(intervals.at(-1).delay, 500);
    assert.deepEqual(cleared, ['cozy-loop']);
    assert.equal(music.returnToCozy(), true);
    assert.equal(music.mode, 'cozy');
    assert.equal(intervals.at(-1).delay, 60 / 72 * 1000);
    music.stop();
    assert.equal(music.mode, 'cozy');
    assert.equal(music.setMode('disco'), false);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test('music volume stays within the supported range', () => {
  const music = new CozyMusic();
  music.setVolume(-0.5);
  assert.equal(music.volume, 0);
  music.setVolume(1.5);
  assert.equal(music.volume, 1);
});
