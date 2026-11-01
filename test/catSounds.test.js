import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_SOUNDS, CatSounds } from '../src/game/audio/CatSounds.js';

function makeAudioFactory(clips) {
  return (url) => {
    const clip = {
      url,
      currentTime: 1,
      volume: 1,
      preload: '',
      playCount: 0,
      paused: false,
      play() {
        this.playCount += 1;
        this.paused = false;
        return Promise.resolve();
      },
      pause() {
        this.paused = true;
      },
    };
    clips.push(clip);
    return clip;
  };
}

test('chooses varied sound clips for each action without immediate repeats', () => {
  const clips = [];
  const sounds = new CatSounds({
    volume: 0.25,
    random: () => 0,
    audioFactory: makeAudioFactory(clips),
  });

  for (const [action, variants] of Object.entries(ACTION_SOUNDS)) {
    assert.equal(sounds.playAction(action), true);
    const firstUrl = sounds.lastSoundByAction.get(action);
    const firstClip = sounds.clips.get(firstUrl);
    assert.ok(variants.includes(firstUrl));
    assert.equal(firstClip.volume, 0.25);
    assert.equal(firstClip.currentTime, 0);

    assert.equal(sounds.playAction(action), true);
    const secondUrl = sounds.lastSoundByAction.get(action);
    assert.ok(variants.includes(secondUrl));
    assert.notEqual(secondUrl, firstUrl);
  }
});

test('does not play when disabled or when the action has no sound', () => {
  const clips = [];
  const sounds = new CatSounds({ enabled: false, audioFactory: makeAudioFactory(clips) });
  assert.equal(sounds.playAction('food'), false);
  sounds.setEnabled(true);
  assert.equal(sounds.playAction('unknown'), false);
  assert.equal(clips.length, 0);
});

test('plays at most one cat sound at a time', () => {
  const clips = [];
  const sounds = new CatSounds({ random: () => 0, audioFactory: makeAudioFactory(clips) });
  sounds.playAction('food');
  const firstClip = clips[0];

  sounds.playAction('water');

  assert.equal(firstClip.paused, true);
  assert.equal(firstClip.currentTime, 0);
  assert.equal(clips[1].paused, false);
});

test('disabling sounds stops clips that are already playing', () => {
  const clips = [];
  const sounds = new CatSounds({ random: () => 0, audioFactory: makeAudioFactory(clips) });
  sounds.playAction('play');
  const [clip] = clips;

  sounds.setEnabled(false);

  assert.equal(clip.paused, true);
  assert.equal(clip.currentTime, 0);
});
