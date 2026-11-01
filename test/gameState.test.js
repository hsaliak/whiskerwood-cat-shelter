import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CATS,
  SAMPLE_CATS,
  CAT_PERSONALITIES,
  addCat,
  VISITORS,
  adoptCat,
  applyCareAction,
  assessVisitor,
  canAdopt,
  createInitialState,
  customizeIncomingCat,
  endDay,
  resolveDailyEvent,
  welcomeIncomingCat,
  getMood,
  isGoodMood,
} from '../src/game/state/gameState.js';

test('starts with two distinct cats ready for care', () => {
  const state = createInitialState();
  assert.equal(state.cats.length, 2);
  assert.notEqual(state.cats[0].color, state.cats[1].color);
  assert.notEqual(state.cats[0].size, state.cats[1].size);
  assert.equal(state.selectedCatId, state.cats[0].id);
  assert.equal(state.day, 1);
  assert.ok(VISITORS.includes(state.visitor));
  assert.ok(state.cats.every(({ personality }) => CAT_PERSONALITIES.includes(personality)));
  assert.ok(state.cats.every(({ bond }) => bond >= 0 && bond <= 100));
});

test('visitor profiles provide balanced trust types and distinct appearances', () => {
  assert.equal(VISITORS.length, 8);
  assert.equal(new Set(VISITORS.map(({ name }) => name)).size, VISITORS.length);
  assert.equal(new Set(VISITORS.map(({ avatar }) => avatar)).size, VISITORS.length);
  assert.equal(VISITORS.filter(({ type }) => type === 'trustworthy').length, 4);
  assert.equal(VISITORS.filter(({ type }) => type === 'shifty').length, 4);
  VISITORS.forEach((visitor) => {
    assert.ok(visitor.description);
    assert.equal(visitor.clues.length, 2);
    assert.ok(visitor.explanation);
    assert.ok(visitor.greeting);
    assert.ok(visitor.acceptResponse);
    assert.ok(visitor.rejectResponse);
    assert.match(visitor.color, /^#[0-9a-f]{6}$/i);
  });
});

test('visitors start randomly and a new day avoids an immediate repeat', () => {
  const firstState = createInitialState(() => 0);
  const otherState = createInitialState(() => 0.99);
  assert.notEqual(firstState.visitor, otherState.visitor);

  const previousVisitor = firstState.visitor;
  const nextOptions = VISITORS.filter((visitor) => visitor !== previousVisitor);
  endDay(firstState, () => 0);
  assert.equal(firstState.visitor, nextOptions[0]);
  assert.notEqual(firstState.visitor, previousVisitor);
});

test('care actions reduce the matching need and clamp values', () => {
  const state = createInitialState();
  state.cats[0].needs.hunger = 95;
  assert.equal(applyCareAction(state, 'food'), true);
  assert.equal(state.cats[0].needs.hunger, 40);
  assert.equal(applyCareAction(state, 'water'), true);
  assert.equal(state.cats[0].needs.thirst, 0);
  state.cats[0].needs.fatigue = 80;
  assert.equal(applyCareAction(state, 'rest'), true);
  assert.equal(state.cats[0].needs.fatigue, 25);
  assert.match(state.message, /nap restored energy/i);
  state.cats[0].needs.fatigue = 20;
  assert.equal(applyCareAction(state, 'rest'), true);
  assert.equal(state.cats[0].needs.fatigue, 0);
  assert.equal(applyCareAction(state, 'unknown'), false);
});

test('petting a cat leaves needs unchanged and increases bond', () => {
  const state = createInitialState();
  const needsBefore = { ...state.cats[0].needs };
  const bondBefore = state.cats[0].bond;
  assert.equal(applyCareAction(state, 'pet'), true);
  assert.deepEqual(state.cats[0].needs, needsBefore);
  assert.equal(state.cats[0].bond, bondBefore + 3);
  assert.match(state.message, /gentle pets/i);
});

test('treats, brushing, and feather toys affect needs and keep bond bounded', () => {
  const state = createInitialState();
  const cat = state.cats[0];
  cat.bond = 98;
  cat.needs.hunger = 50;
  cat.needs.play = 60;
  cat.needs.fatigue = 10;
  assert.equal(applyCareAction(state, 'treat'), true);
  assert.equal(cat.needs.hunger, 32);
  assert.equal(cat.bond, 100);
  assert.equal(applyCareAction(state, 'brush'), true);
  assert.equal(cat.bond, 100);
  assert.equal(applyCareAction(state, 'toy'), true);
  assert.equal(cat.needs.play, 32);
  assert.equal(cat.needs.fatigue, 18);
  assert.equal(cat.bond, 100);
});

test('small daily events appear every other day and can be accepted or skipped', () => {
  const state = createInitialState(() => 0.4);
  endDay(state, () => 0.4);
  assert.equal(state.day, 2);
  assert.equal(state.dailyEvent.title, 'A volunteer brings a feather toy');
  const cat = state.cats[0];
  const playBefore = cat.needs.play;
  const bondBefore = cat.bond;
  assert.equal(resolveDailyEvent(state, true), true);
  assert.equal(cat.needs.play, playBefore - 10);
  assert.equal(cat.bond, bondBefore + 2);
  assert.equal(resolveDailyEvent(state, true), false);

  endDay(state, () => 0.4);
  assert.equal(state.dailyEvent, null);
  endDay(state, () => 0.4);
  assert.equal(state.day, 4);
  assert.ok(state.dailyEvent);
  const needsBeforeSkip = { ...state.cats[0].needs };
  const bondBeforeSkip = state.cats[0].bond;
  assert.equal(resolveDailyEvent(state, false), true);
  assert.deepEqual(state.cats[0].needs, needsBeforeSkip);
  assert.equal(state.cats[0].bond, bondBeforeSkip);
  assert.equal(state.dailyEvent.completed, true);
});

test('needs advance only when End Day is selected', () => {
  const state = createInitialState();
  const hungerAtStart = state.cats[0].needs.hunger;
  const previousVisitor = state.visitor;
  endDay(state, () => 0.5);
  assert.equal(state.day, 2);
  assert.equal(state.cats[0].needs.hunger, hungerAtStart + 18);
  assert.notEqual(state.visitor, previousVisitor);
  assert.equal(state.assessment, null);
});

test('visitor assessment awards +1 for correct and -1 for incorrect decisions', () => {
  const trustworthyState = createInitialState();
  trustworthyState.visitor = VISITORS.find(({ type }) => type === 'trustworthy');
  assert.equal(assessVisitor(trustworthyState, 'accept'), true);
  assert.equal(trustworthyState.score, 1);
  assert.equal(assessVisitor(trustworthyState, 'reject'), false);

  trustworthyState.visitor = { type: 'shifty', name: 'Test visitor' };
  trustworthyState.assessment = null;
  assert.equal(assessVisitor(trustworthyState, 'accept'), true);
  assert.equal(trustworthyState.score, 0);

  assert.equal(assessVisitor(createInitialState(), 'maybe'), false);
});

test('all visitor trust/decision pairs score correctly', () => {
  for (const type of ['trustworthy', 'shifty']) {
    for (const decision of ['accept', 'reject']) {
      const state = createInitialState();
      state.visitor = { name: 'Test visitor', type };
      assessVisitor(state, decision);
      const wasCorrect = (type === 'trustworthy') === (decision === 'accept');
      assert.equal(state.score, wasCorrect ? 1 : -1);
      assert.equal(state.assessment.correct, wasCorrect);
    }
  }
});

test('only an accepted trustworthy visitor can adopt a cat in a good mood', () => {
  const state = createInitialState();
  state.visitor = VISITORS.find(({ type }) => type === 'trustworthy');
  assert.equal(isGoodMood(state.cats[0]), true);
  assert.equal(canAdopt(state, state.cats[0].id), false);
  assessVisitor(state, 'accept');
  assert.equal(canAdopt(state, state.cats[0].id), true);
  assert.equal(adoptCat(state, state.cats[0].id), true);
  assert.equal(state.cats.length, 1);
  assert.equal(state.score, 3);
  assert.equal(state.adoptedToday, true);
  assert.equal(state.pendingArrival, true);
  assert.equal(adoptCat(state, state.cats[0].id), false);
});

test('adoption schedules a distinct replacement cat for the next day', () => {
  const state = createInitialState();
  state.visitor = VISITORS.find(({ type }) => type === 'trustworthy');
  const originalIds = new Set(state.cats.map(({ id }) => id));
  assessVisitor(state, 'accept');
  assert.equal(adoptCat(state, state.cats[0].id), true);
  assert.equal(state.pendingArrival, true);
  assert.equal(state.cats.length, 1);

  endDay(state);
  assert.equal(state.day, 2);
  assert.equal(state.cats.length, 1);
  assert.equal(state.pendingArrival, false);
  assert.equal(state.pendingArrivalCat.name, 'Poppy');
  assert.equal(state.lastArrival.name, 'Poppy');
  assert.equal(originalIds.has(state.pendingArrivalCat.id), false);
  assert.equal(state.selectedCatId, state.cats[0].id);
  assert.equal(welcomeIncomingCat(state), true);
  assert.equal(state.cats.length, 2);
  assert.equal(state.selectedCatId, state.lastArrival.id);
  assert.equal(state.pendingArrivalCat, null);

  endDay(state);
  assert.equal(state.cats.length, 2);
  assert.equal(state.lastArrival, null);
});

test('a replacement becomes selected if the adopted cat was the last resident', () => {
  const state = createInitialState();
  state.visitor = VISITORS.find(({ type }) => type === 'trustworthy');
  state.cats = [state.cats[0]];
  state.selectedCatId = state.cats[0].id;
  assessVisitor(state, 'accept');
  assert.equal(adoptCat(state, state.selectedCatId), true);
  assert.equal(state.cats.length, 0);

  endDay(state);
  assert.equal(state.cats.length, 0);
  assert.ok(state.pendingArrivalCat);
  assert.equal(welcomeIncomingCat(state), true);
  assert.equal(state.cats.length, 1);
  assert.equal(state.selectedCatId, state.cats[0].id);
});

test('new cats stay outside the shelter until intake appearance is confirmed', () => {
  const state = createInitialState(() => 0);
  state.pendingArrival = true;
  endDay(state, () => 0);
  const incoming = state.pendingArrivalCat;
  assert.equal(state.cats.length, 2);
  assert.ok(incoming);
  assert.equal(incoming.personality, 'curious');
  assert.equal(incoming.bond, 0);

  assert.equal(customizeIncomingCat(state, {
    size: 'fat',
    build: 'round',
    color: '#335577',
    pattern: 'calico',
    patternColor: '#f5e4c9',
  }), true);
  assert.equal(incoming.size, 'fat');
  assert.equal(incoming.build, 'round');
  assert.equal(incoming.color, 0x335577);
  assert.equal(incoming.pattern, 'calico');
  assert.equal(incoming.markings, 'calico');
  assert.equal(incoming.patternColor, 0xf5e4c9);
  assert.equal(welcomeIncomingCat(state), true);
  assert.equal(state.cats.length, 3);
  assert.equal(state.cats.at(-1).color, 0x335577);
  assert.equal(state.cats.at(-1).patternColor, 0xf5e4c9);
  assert.equal(customizeIncomingCat(state, { size: 'invalid' }), false);
  assert.equal(welcomeIncomingCat(state), false);
});

test('arrival appearance ignores unsupported colors and options', () => {
  const state = createInitialState(() => 0);
  state.pendingArrival = true;
  endDay(state, () => 0);
  const incoming = state.pendingArrivalCat;
  const originalColor = incoming.color;
  assert.equal(customizeIncomingCat(state, {
    size: 'giant',
    build: 'giant',
    color: 'red',
    pattern: 'spots',
    patternColor: '#ff00aa',
  }), true);
  assert.equal(incoming.size, 'small');
  assert.equal(incoming.build, 'average');
  assert.equal(incoming.color, originalColor);
  assert.equal(incoming.pattern, 'tabby');
  assert.equal(incoming.patternColor, 0xff00aa);
});

test('shifty visitors cannot lead to adoption, even when accepted', () => {
  const state = createInitialState();
  state.visitor = { name: 'Test visitor', type: 'shifty' };
  assessVisitor(state, 'accept');
  assert.equal(canAdopt(state, state.cats[0].id), false);
  assert.equal(adoptCat(state, state.cats[0].id), false);
});

test('unhappy cats are not adoptable and need values stay bounded', () => {
  const state = createInitialState();
  state.visitor = VISITORS.find(({ type }) => type === 'trustworthy');
  assessVisitor(state, 'accept');
  state.cats[0].needs.hunger = 50;
  assert.equal(isGoodMood(state.cats[0]), false);
  assert.equal(getMood(state.cats[0]), 'A little unsettled');
  assert.equal(canAdopt(state, state.cats[0].id), false);
  for (let day = 0; day < 10; day += 1) endDay(state);
  assert.ok(state.cats.every((cat) => Object.values(cat.needs).every((need) => need <= 100)));
});

test('the state enforces the ten-cat shelter limit', () => {
  const state = createInitialState();
  assert.equal(MAX_CATS, 10);
  assert.equal(SAMPLE_CATS.length, 2);
  for (let index = state.cats.length; index < MAX_CATS; index += 1) {
    assert.equal(addCat(state, { id: `cat-${index}`, needs: { hunger: 0, thirst: 0, play: 0, fatigue: 0 } }), true);
  }
  assert.equal(state.cats.length, MAX_CATS);
  assert.equal(addCat(state, { id: 'too-many', needs: {} }), false);
  assert.equal(addCat(state, { id: 'cat-9', needs: {} }), false);
});
