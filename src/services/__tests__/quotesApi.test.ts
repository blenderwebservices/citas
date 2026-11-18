import test from 'node:test';
import assert from 'node:assert/strict';
import { API_SOURCE_OPTIONS, fetchPositiveQuote, fetchZenQuote } from '../quotesApi';

test('API_SOURCE_OPTIONS has 4 configured providers', () => {
  assert.equal(API_SOURCE_OPTIONS.length, 4);
  const ids = API_SOURCE_OPTIONS.map((o) => o.id);
  assert.deepEqual(ids, ['local', 'github-cdn', 'positive-api', 'zenquotes']);
});

test('API_SOURCE_OPTIONS local provider is marked offline', () => {
  const local = API_SOURCE_OPTIONS.find((o) => o.id === 'local');
  assert.ok(local);
  assert.equal(local.badge, 'Offline');
  assert.equal(local.lang, 'es');
});
