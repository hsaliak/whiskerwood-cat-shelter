const SOUND_ROOT = '/assets/audio/';

const ACTION_SOUNDS = Object.freeze({
  food: Object.freeze([
    `${SOUND_ROOT}cat_mewfood.wav`,
    `${SOUND_ROOT}cat_mewpurr.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
  ]),
  treat: Object.freeze([
    `${SOUND_ROOT}cat_mewfood.wav`,
    `${SOUND_ROOT}cat_mewpurr.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
  ]),
  brush: Object.freeze([
    `${SOUND_ROOT}cat_mewpurr2.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
  ]),
  water: Object.freeze([
    `${SOUND_ROOT}cat_softmew.wav`,
    `${SOUND_ROOT}cat_mewpurr2.wav`,
    `${SOUND_ROOT}cat_mewfood.wav`,
  ]),
  play: Object.freeze([
    `${SOUND_ROOT}cat_mewpurr.wav`,
    `${SOUND_ROOT}cat_mewpurr2.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
  ]),
  toy: Object.freeze([
    `${SOUND_ROOT}cat_mewpurr.wav`,
    `${SOUND_ROOT}cat_mewpurr2.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
  ]),
  walk: Object.freeze([
    `${SOUND_ROOT}cat_mewpurr2.wav`,
    `${SOUND_ROOT}cat_softmew.wav`,
    `${SOUND_ROOT}cat_mewfood.wav`,
  ]),
});

function randomItem(items, random) {
  const value = Number(random());
  const boundedValue = Number.isFinite(value)
    ? Math.max(0, Math.min(value, 1 - Number.EPSILON))
    : 0;
  return items[Math.floor(boundedValue * items.length)];
}

export class CatSounds {
  constructor({ enabled = true, volume = 0.38, random = Math.random, audioFactory } = {}) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
    this.random = random;
    this.audioFactory = audioFactory ?? ((url) => (
      typeof Audio === 'undefined' ? null : new Audio(url)
    ));
    this.clips = new Map();
    this.lastSoundByAction = new Map();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.clips.forEach((clip) => {
        clip.pause();
        clip.currentTime = 0;
      });
    }
  }

  playAction(action) {
    const variants = ACTION_SOUNDS[action];
    if (!this.enabled || !variants) return false;

    const previous = this.lastSoundByAction.get(action);
    const choices = variants.length > 1
      ? variants.filter((url) => url !== previous)
      : variants;
    const url = randomItem(choices, this.random);
    this.lastSoundByAction.set(action, url);

    try {
      this.clips.forEach((activeClip, activeUrl) => {
        if (activeUrl !== url) {
          activeClip.pause();
          activeClip.currentTime = 0;
        }
      });
      let clip = this.clips.get(url);
      if (!clip) {
        clip = this.audioFactory(url);
        if (!clip) return false;
        clip.preload = 'auto';
        this.clips.set(url, clip);
      }
      clip.volume = this.volume;
      clip.currentTime = 0;
      const playback = clip.play();
      playback?.catch?.(() => {});
      return true;
    } catch {
      return false;
    }
  }
}

export { ACTION_SOUNDS };
