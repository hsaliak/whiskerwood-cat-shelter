import test from 'node:test';
import assert from 'node:assert/strict';
import { getHemisphereForLocale, getSeasonForDate, getSeasonForLocale } from '../src/game/state/season.js';

test('season selection follows the browser locale hemisphere', () => {
  const january = new Date(2025, 0, 15);
  const july = new Date(2025, 6, 15);
  assert.equal(getHemisphereForLocale('en-AU'), 'south');
  assert.equal(getHemisphereForLocale('pt-BR'), 'south');
  assert.equal(getHemisphereForLocale('en-US'), 'north');
  assert.equal(getSeasonForDate(january, 'north'), 'winter');
  assert.equal(getSeasonForDate(january, 'south'), 'summer');
  assert.equal(getSeasonForDate(july, 'north'), 'summer');
  assert.equal(getSeasonForDate(july, 'south'), 'winter');
  assert.equal(getSeasonForLocale(january, 'en-AU'), 'summer');
  assert.equal(getSeasonForLocale(january, 'en-AU', 'north'), 'winter');
  assert.equal(getSeasonForLocale(january, 'en-US', 'south'), 'summer');
});

test('locales without an explicit region fall back to Northern Hemisphere seasons', () => {
  assert.equal(getHemisphereForLocale('not-a-locale'), 'north');
  assert.equal(getHemisphereForLocale('en'), 'north');
});
