const TEMPO_BPM = 72;
const DISCO_TEMPO_BPM = 120;
const CHORDS = [
  [48, 55, 59, 64], // Cmaj7
  [43, 50, 55, 59], // G
  [45, 52, 55, 60], // Am7
  [41, 48, 52, 57], // Fmaj7
];
const MELODY = [72, null, 76, 79, 76, null, 74, null];
const DISCO_CHORDS = [
  [48, 55, 60, 64],
  [45, 52, 57, 60],
  [41, 48, 53, 57],
  [43, 50, 55, 59],
];
const DISCO_MELODY = [84, null, 79, 83, 86, null, 83, 79];

export class CozyMusic {
  constructor() {
    this.context = null;
    this.master = null;
    this.timer = null;
    this.beat = 0;
    this.volume = 0.32;
    this.playing = false;
    this.mode = 'cozy';
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.08);
    }
  }

  async toggle() {
    if (this.playing) {
      this.stop();
      return false;
    }
    return this.start();
  }

  async start() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!this.context) {
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
    }

    await this.context.resume();
    this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.08);
    this.playing = true;
    this.mode = 'cozy';
    this.beat = 0;
    this.playBeat();
    this.scheduleBeatTimer();
    return true;
  }

  scheduleBeatTimer() {
    if (this.timer !== null) window.clearInterval(this.timer);
    const tempo = this.mode === 'disco' ? DISCO_TEMPO_BPM : TEMPO_BPM;
    this.timer = window.setInterval(() => this.playBeat(), (60 / tempo) * 1000);
  }

  setMode(mode) {
    if (!this.playing || !['cozy', 'disco'].includes(mode)) return false;
    if (this.mode === mode) return true;
    this.mode = mode;
    this.beat = 0;
    this.playBeat();
    this.scheduleBeatTimer();
    return true;
  }

  returnToCozy() {
    return this.setMode('cozy');
  }

  stop() {
    this.playing = false;
    this.mode = 'cozy';
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.06);
    }
  }

  playBeat() {
    if (!this.context || !this.master || !this.playing) return;
    if (this.mode === 'disco') {
      this.playDiscoBeat();
      return;
    }
    const beatInLoop = this.beat % 16;
    const bar = Math.floor(beatInLoop / 4);
    const chord = CHORDS[bar];
    const startAt = this.context.currentTime + 0.025;

    if (beatInLoop % 4 === 0) {
      chord.forEach((note, index) => {
        this.playNote(note, startAt, 2.8, index === 0 ? 0.065 : 0.04);
      });
      this.playNote(chord[0] - 12, startAt, 3.2, 0.035, 'triangle');
    }

    if (beatInLoop % 2 === 0) {
      const melodyNote = MELODY[Math.floor(beatInLoop / 2)];
      if (melodyNote !== null) this.playNote(melodyNote, startAt, 0.72, 0.085);
    }
    this.beat += 1;
  }

  playDiscoBeat() {
    const beat = this.beat % 16;
    const chord = DISCO_CHORDS[Math.floor(beat / 4)];
    const startAt = this.context.currentTime + 0.025;
    this.playNote(36, startAt, 0.2, 0.16, 'triangle');
    this.playNote(84, startAt, 0.08, 0.035, 'square');
    if (beat % 2 === 0) {
      this.playNote(chord[beat % chord.length] + 12, startAt, 0.18, 0.075, 'sawtooth');
      const melody = DISCO_MELODY[Math.floor(beat / 2)];
      if (melody !== null) this.playNote(melody, startAt + 0.03, 0.22, 0.065, 'square');
    }
    this.beat += 1;
  }

  playNote(midiNote, startAt, duration, amplitude, wave = 'sine') {
    const frequency = 440 * (2 ** ((midiNote - 69) / 12));
    const noteGain = this.context.createGain();
    const oscillator = this.context.createOscillator();
    const overtone = this.context.createOscillator();
    const overtoneGain = this.context.createGain();

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(frequency * 2, startAt);
    noteGain.gain.setValueAtTime(0.0001, startAt);
    noteGain.gain.exponentialRampToValueAtTime(amplitude, startAt + 0.055);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    overtoneGain.gain.value = 0.13;

    oscillator.connect(noteGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(noteGain);
    noteGain.connect(this.master);
    oscillator.start(startAt);
    overtone.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
    overtone.stop(startAt + duration + 0.03);
  }
}
