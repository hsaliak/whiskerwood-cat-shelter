import test from 'node:test';
import assert from 'node:assert/strict';
import { CAT_FACTS, catBehaviorThought, chooseCatThought } from '../src/game/cats/catThoughts.js';

test('need thoughts name the highest need and show urgent wording', () => {
  const thought = chooseCatThought({
    personality: 'shy',
    needs: { hunger: 62, thirst: 80, play: 55, fatigue: 70 },
  }, () => 0);
  assert.equal(thought.kind, 'need');
  assert.equal(thought.need, 'thirst');
  assert.equal(thought.urgency, 'urgent');
  assert.equal(thought.text, "I'm thirsty. Could I have fresh water?");
  assert.equal(thought.source, null);
});

test('need thoughts change from gentle to urgent at the correct levels and avoid repeats', () => {
  const cat = { needs: { hunger: 50, thirst: 0, play: 0, fatigue: 0 } };
  const mild = chooseCatThought(cat, () => 0);
  assert.equal(mild.need, 'hunger');
  assert.equal(mild.urgency, 'mild');
  assert.equal(mild.text, 'My tummy is rumbling.');

  const repeated = chooseCatThought(cat, () => 0, -1, mild.text);
  assert.equal(repeated.text, 'I could eat a little something.');
  cat.needs.hunger = 44;
  assert.equal(chooseCatThought(cat, () => 0).kind, 'fact');
  cat.needs.hunger = 45;
  assert.equal(chooseCatThought(cat, () => 0).urgency, 'mild');
  cat.needs.hunger = 70;
  const urgent = chooseCatThought(cat, () => 0);
  assert.equal(urgent.urgency, 'urgent');
  assert.match(urgent.text, /hungry/i);
});

test('fact thoughts include an attribution and avoid the previous fact', () => {
  const first = chooseCatThought({ needs: {} }, () => 0);
  assert.equal(first.kind, 'fact');
  assert.equal(first.factIndex, 0);
  assert.equal(first.source, 'PetMD');
  assert.match(first.url, /^https:\/\//);

  const next = chooseCatThought({ needs: {} }, () => 0, first.factIndex);
  assert.notEqual(next.factIndex, first.factIndex);
  assert.equal(CAT_FACTS.length, 4);
});

test('behavior thoughts reflect personality and have a friendly fallback', () => {
  assert.equal(catBehaviorThought('pet', 'cuddly'), 'Purr! Stay close?');
  assert.equal(catBehaviorThought('pet', 'shy', 70), 'Your pets are my favorite!');
  assert.equal(catBehaviorThought('bird', 'shy'), 'A bird... I will watch from here.');
  assert.equal(catBehaviorThought('rest'), 'Nap time. Purr-fect.');
  assert.equal(catBehaviorThought('unknown'), 'What a cozy place.');
});
