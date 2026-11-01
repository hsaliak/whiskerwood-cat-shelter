import Phaser from 'phaser';
import { ShelterScene } from './game/scenes/ShelterScene.js';
import { CAT_BUILDS, CAT_PATTERNS, getMood, isGoodMood } from './game/state/gameState.js';
import { CozyMusic } from './game/audio/cozyMusic.js';
import { CatSounds } from './game/audio/CatSounds.js';

const byId = (id) => document.getElementById(id);
let gameEvents;
let currentArrivalCat = null;
let lastVisitorName = null;
const portraitSource = new Image();
portraitSource.onload = () => {
  if (currentArrivalCat) drawArrivalPortrait(currentArrivalCat);
};
portraitSource.src = '/assets/cats/frolicforge/cat-walk-256.png';

function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The game still works when browser storage is unavailable.
  }
}

const seasonHemisphereControl = byId('season-hemisphere');
const storedHemisphere = readPreference('whiskerwood-season-hemisphere', 'auto');
const initialHemisphere = ['auto', 'north', 'south'].includes(storedHemisphere) ? storedHemisphere : 'auto';
seasonHemisphereControl.value = initialHemisphere;
window.whiskerwoodSeasonHemisphere = initialHemisphere;

function makeButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function renderCatPicker(state) {
  const picker = byId('cat-picker');
  picker.replaceChildren();
  state.cats.forEach((cat, index) => {
    const button = makeButton('', 'cat-chip', () => {
      gameEvents.emit('select-cat', cat.id);
    });
    const avatar = document.createElement('span');
    avatar.className = 'cat-chip-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.style.backgroundPositionX = `${-(index % 3) * 128}px`;
    const name = document.createElement('span');
    name.textContent = cat.name;
    button.append(avatar, name);
    button.setAttribute('aria-pressed', String(cat.id === state.selectedCatId));
    picker.append(button);
  });
  if (state.cats.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'empty';
    empty.textContent = 'All the cats have found loving homes.';
    picker.append(empty);
  }
}

function renderCatDetails(state) {
  const cat = state.cats.find(({ id }) => id === state.selectedCatId);
  const subtitle = byId('cat-subtitle');
  const details = byId('cat-details');
  const actions = byId('care-actions');
  if (!cat) {
    subtitle.textContent = 'Your shelter is waiting for its next resident.';
    details.innerHTML = '<p class="empty">There are no cats to care for right now.</p>';
    actions.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    return;
  }

  const personality = cat.personality ?? 'curious';
  const personalityLabel = `${personality[0].toUpperCase()}${personality.slice(1)} personality`;
  const bond = Math.max(0, Math.min(100, cat.bond ?? 0));
  subtitle.textContent = `${cat.breed} · ${cat.size} · ${cat.build ?? 'average'} build · ${cat.fur} coat · ${personalityLabel}`;
  const mood = getMood(cat);
  const needs = [
    ['Hunger', cat.needs.hunger],
    ['Thirst', cat.needs.thirst],
    ['Play', cat.needs.play],
    ['Tiredness', cat.needs.fatigue],
  ];
  details.innerHTML = `<div class="mood-pill"><span class="mood-dot"></span>${mood}</div><p class="need-direction">Need level · lower is better</p><div class="need-list">${needs.map(([name, value]) => `
    <div class="need-row"><span>${name} need</span><div class="track" role="progressbar" aria-label="${name} need; 0 is calm, 100 is urgent" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><div class="fill${value >= 55 ? ' high' : ''}" style="width:${value}%"></div></div><span class="need-number">${value}/100</span></div>`).join('')}</div><div class="bond-meter"><div class="bond-heading"><span>Bond</span><span>${bond}/100</span></div><div class="track" role="progressbar" aria-label="Bond with ${cat.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${bond}"><div class="bond-fill" style="width:${bond}%"></div></div></div>`;
  actions.querySelectorAll('button').forEach((button) => { button.disabled = false; });
}

function renderVisitor(state) {
  const visitor = state.visitor;
  const avatar = byId('visitor-avatar');
  avatar.textContent = visitor.avatar ?? '🧑';
  avatar.style.backgroundColor = visitor.color ?? '#e8e2d8';
  byId('visitor-title').textContent = visitor.name;
  byId('visitor-greeting').textContent = visitor.greeting ?? '';
  if (lastVisitorName !== visitor.name) {
    const card = byId('visitor-card');
    card.classList.remove('visitor-arrive');
    void card.offsetWidth;
    card.classList.add('visitor-arrive');
    lastVisitorName = visitor.name;
  }
  byId('visitor-description').textContent = visitor.description;
  const clueList = byId('visitor-clues');
  clueList.replaceChildren();
  visitor.clues.forEach((clue) => {
    const item = document.createElement('li');
    item.textContent = clue;
    clueList.append(item);
  });

  const controls = byId('visitor-controls');
  controls.replaceChildren();
  if (!state.assessment) {
    const choices = document.createElement('div');
    choices.className = 'visitor-actions';
    choices.append(
      makeButton('✓ Accept visitor', 'button accept', () => gameEvents.emit('assess-visitor', 'accept')),
      makeButton('✕ Turn away', 'button reject', () => gameEvents.emit('assess-visitor', 'reject')),
    );
    controls.append(choices);
    return;
  }

  const result = document.createElement('p');
  result.className = `result${state.assessment.correct ? '' : ' wrong'}`;
  result.textContent = state.assessment.correct
    ? `Good judgment — ${visitor.name} was ${visitor.type}. You earned 1 point.`
    : `That was a mistake — ${visitor.name} was ${visitor.type}. You lost 1 point.`;
  controls.append(result);
  const rationale = document.createElement('p');
  rationale.className = 'visitor-rationale';
  rationale.textContent = `Why: ${visitor.explanation}`;
  controls.append(rationale);
  const response = document.createElement('p');
  response.className = 'visitor-response';
  response.textContent = visitor[state.assessment.decision === 'accept' ? 'acceptResponse' : 'rejectResponse'] ?? '';
  controls.append(response);

  if (state.assessment.decision !== 'accept' || visitor.type !== 'trustworthy') {
    const note = document.createElement('p');
    note.className = 'empty';
    note.style.margin = '10px 0 0';
    note.textContent = visitor.type === 'shifty' && state.assessment.decision === 'accept'
      ? 'The visitor was not allowed to meet the cats and has left.'
      : 'The visitor has left the shelter.';
    controls.append(note);
    return;
  }

  if (state.adoptedToday) {
    const note = document.createElement('p');
    note.className = 'empty';
    note.style.margin = '10px 0 0';
    note.textContent = 'An adoption is complete. The visitor has gone home with a new friend.';
    controls.append(note);
    return;
  }

  const eligibleCats = state.cats.filter(isGoodMood);
  const adoptionTitle = document.createElement('p');
  adoptionTitle.className = 'small-note';
  adoptionTitle.style.margin = '12px 0 0';
  adoptionTitle.textContent = 'This visitor is ready to meet a cat in a good mood:';
  controls.append(adoptionTitle);

  if (eligibleCats.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty';
    note.style.margin = '8px 0 0';
    note.textContent = 'No cats are ready for adoption today. Give them care and try again after End Day.';
    controls.append(note);
    return;
  }

  const adoptionList = document.createElement('div');
  adoptionList.className = 'adoption-list';
  eligibleCats.forEach((cat) => {
    adoptionList.append(makeButton(`Let ${cat.name} go home · adopt (+2)`, 'button', () => {
      gameEvents.emit('adopt-cat', cat.id);
    }));
  });
  controls.append(adoptionList);
}

function colorHex(value, fallback) {
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return `#${Math.max(0, value).toString(16).padStart(6, '0').slice(-6)}`;
  return fallback;
}

function drawArrivalPortrait(cat) {
  const canvas = byId('arrival-portrait');
  const context = canvas?.getContext('2d');
  if (!context || !portraitSource.complete || portraitSource.naturalWidth === 0) return;
  const source = document.createElement('canvas');
  source.width = 256;
  source.height = 256;
  const sourceContext = source.getContext('2d');
  sourceContext.drawImage(portraitSource, 0, 0, 256, 256, 0, 0, 256, 256);
  const pixels = sourceContext.getImageData(0, 0, 256, 256);
  const coat = colorHex(cat.color, '#c98270').slice(1);
  const red = Number.parseInt(coat.slice(0, 2), 16);
  const green = Number.parseInt(coat.slice(2, 4), 16);
  const blue = Number.parseInt(coat.slice(4, 6), 16);
  for (let index = 0; index < pixels.data.length; index += 4) {
    if (pixels.data[index + 3] === 0) continue;
    const light = (pixels.data[index] + pixels.data[index + 1] + pixels.data[index + 2]) / (3 * 255);
    const shade = 0.42 + light * 0.66;
    pixels.data[index] = Math.min(255, red * shade);
    pixels.data[index + 1] = Math.min(255, green * shade);
    pixels.data[index + 2] = Math.min(255, blue * shade);
  }
  sourceContext.putImageData(pixels, 0, 0);

  context.clearRect(0, 0, 256, 256);
  const sizeScale = cat.size === 'small' ? 0.86 : cat.size === 'fat' ? 1.08 : 0.96;
  const build = CAT_BUILDS.includes(cat.build) ? cat.build : 'average';
  const scaleX = sizeScale * (build === 'slim' ? 0.86 : build === 'round' ? 1.14 : 1);
  const scaleY = sizeScale * (build === 'slim' ? 1.04 : build === 'round' ? 0.96 : 1);
  context.setTransform(scaleX, 0, 0, scaleY, 128 - 128 * scaleX, 236 - 256 * scaleY);
  context.drawImage(source, 0, 0);
  context.globalCompositeOperation = 'source-atop';
  context.fillStyle = colorHex(cat.patternColor ?? cat.accent, '#ffe6d8');
  const pattern = CAT_PATTERNS.includes(cat.pattern) ? cat.pattern : CAT_PATTERNS.includes(cat.markings) ? cat.markings : 'tabby';
  if (pattern === 'tabby') {
    [78, 101, 124, 147].forEach((x, index) => {
      context.beginPath();
      context.roundRect(x, index === 0 || index === 3 ? 128 : 119, 12, index === 0 || index === 3 ? 58 : 66, 6);
      context.fill();
    });
  } else if (pattern === 'tuxedo') {
    context.beginPath();
    context.ellipse(78, 154, 22, 29, 0, 0, Math.PI * 2);
    context.ellipse(70, 202, 16, 8, 0, 0, Math.PI * 2);
    context.ellipse(180, 202, 16, 8, 0, 0, Math.PI * 2);
    context.fill();
  } else if (pattern === 'calico') {
    context.beginPath();
    context.ellipse(79, 130, 21, 15, 0, 0, Math.PI * 2);
    context.ellipse(157, 147, 24, 17, 0, 0, Math.PI * 2);
    context.ellipse(112, 187, 21, 12, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.globalCompositeOperation = 'source-over';
  context.setTransform(1, 0, 0, 1, 0, 0);
}

function renderArrivalCard(state) {
  const cat = state.pendingArrivalCat;
  const backdrop = byId('arrival-backdrop');
  const wasHidden = backdrop.hidden;
  backdrop.hidden = !cat;
  byId('end-day').disabled = Boolean(cat);
  if (!cat) {
    currentArrivalCat = null;
    if (!wasHidden) byId('cat-picker').querySelector('[aria-pressed="true"]')?.focus();
    return;
  }
  currentArrivalCat = cat;
  byId('arrival-name').textContent = cat.name;
  const size = byId('arrival-size');
  const build = byId('arrival-build');
  const pattern = byId('arrival-pattern');
  size.value = cat.size;
  build.value = CAT_BUILDS.includes(cat.build) ? cat.build : 'average';
  pattern.value = CAT_PATTERNS.includes(cat.pattern) ? cat.pattern : CAT_PATTERNS.includes(cat.markings) ? cat.markings : 'tabby';
  byId('arrival-color').value = colorHex(cat.color, '#c98270');
  byId('arrival-pattern-color').value = colorHex(cat.patternColor ?? cat.accent, '#ffe6d8');
  drawArrivalPortrait(cat);
  if (wasHidden) byId('arrival-title').closest('[role="dialog"]').focus();
}

function renderDailyEvent(state) {
  const event = state.dailyEvent;
  const card = byId('daily-event');
  card.hidden = !event || event.completed;
  if (!event || event.completed) return;

  byId('daily-event-title').textContent = event.title;
  byId('daily-event-description').textContent = event.description;
  byId('daily-event-action').textContent = event.actionLabel;
  byId('daily-event-action').disabled = !state.cats.some(({ id }) => id === state.selectedCatId);
}

function renderState(state) {
  byId('day-count').textContent = state.day;
  byId('score-count').textContent = state.score > 0 ? `+${state.score}` : state.score;
  byId('status-message').textContent = state.message;
  renderCatPicker(state);
  renderCatDetails(state);
  renderVisitor(state);
  renderDailyEvent(state);
  renderArrivalCard(state);
}

const catSounds = new CatSounds({
  enabled: readPreference('whiskerwood-cat-sounds', 'true') !== 'false',
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 560,
  backgroundColor: '#f4eadb',
  scene: [ShelterScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  }
});

gameEvents = game.events;
seasonHemisphereControl.addEventListener('change', () => {
  const hemisphere = seasonHemisphereControl.value;
  window.whiskerwoodSeasonHemisphere = hemisphere;
  savePreference('whiskerwood-season-hemisphere', hemisphere);
  gameEvents.emit('season-hemisphere', hemisphere);
});
game.events.on('state-update', renderState);
game.events.on('cat-action-sound', catSounds.playAction, catSounds);

const arrivalControls = ['arrival-size', 'arrival-build', 'arrival-pattern', 'arrival-color', 'arrival-pattern-color'];
function updateIncomingAppearance() {
  if (!currentArrivalCat) return;
  gameEvents.emit('customize-arrival', {
    size: byId('arrival-size').value,
    build: byId('arrival-build').value,
    pattern: byId('arrival-pattern').value,
    color: byId('arrival-color').value,
    patternColor: byId('arrival-pattern-color').value,
  });
}
arrivalControls.forEach((id) => byId(id).addEventListener('input', updateIncomingAppearance));
byId('welcome-cat').addEventListener('click', () => gameEvents.emit('welcome-arrival'));

const soundToggle = byId('sound-toggle');
function updateSoundToggle() {
  soundToggle.textContent = catSounds.enabled ? '🐾 SFX on' : '🐾 SFX off';
  soundToggle.setAttribute('aria-pressed', String(catSounds.enabled));
}
updateSoundToggle();
soundToggle.addEventListener('click', () => {
  catSounds.setEnabled(!catSounds.enabled);
  savePreference('whiskerwood-cat-sounds', String(catSounds.enabled));
  updateSoundToggle();
});

byId('care-actions').addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action) gameEvents.emit('care-action', action);
});
byId('end-day').addEventListener('click', () => gameEvents.emit('end-day'));
byId('daily-event-action').addEventListener('click', () => gameEvents.emit('resolve-daily-event', true));
byId('daily-event-skip').addEventListener('click', () => gameEvents.emit('resolve-daily-event', false));

const guide = byId('first-day-guide');
if (readPreference('whiskerwood-guide-dismissed', 'false') === 'true') guide.hidden = true;
byId('dismiss-guide').addEventListener('click', () => {
  guide.hidden = true;
  savePreference('whiskerwood-guide-dismissed', 'true');
});

const music = new CozyMusic();
const musicButton = byId('music-toggle');
const musicVolume = byId('music-volume');
musicVolume.value = readPreference('whiskerwood-music-volume', musicVolume.value);
music.setVolume(Number(musicVolume.value) / 100);

function updateMusicButton() {
  musicButton.textContent = !music.playing
    ? '♫ Play music'
    : music.mode === 'disco' ? '♫ Disco music' : '♫ Music on';
  musicButton.setAttribute('aria-pressed', String(music.playing));
}

updateMusicButton();
game.events.on('disco-start', () => {
  const changed = music.setMode('disco');
  byId('music-status').textContent = changed
    ? 'Disco music for trampoline time.'
    : 'Turn on music to hear the disco change.';
  updateMusicButton();
});
game.events.on('disco-end', () => {
  const resumed = music.returnToCozy();
  if (resumed) byId('music-status').textContent = 'Back to the cozy music.';
  updateMusicButton();
});
musicVolume.addEventListener('input', () => {
  music.setVolume(Number(musicVolume.value) / 100);
  savePreference('whiskerwood-music-volume', musicVolume.value);
});
musicButton.addEventListener('click', async () => {
  musicButton.disabled = true;
  try {
    const wasPlaying = music.playing;
    const playing = await music.toggle();
    updateMusicButton();
    byId('music-status').textContent = !playing && !wasPlaying && !music.context
      ? 'This browser does not support the music player.'
      : playing ? 'Background music on.' : 'Background music off.';
  } catch {
    byId('music-status').textContent = 'Music could not start. Try again after interacting with the page.';
  } finally {
    musicButton.disabled = false;
  }
});
