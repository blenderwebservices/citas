import assert from 'node:assert/strict';
import test from 'node:test';
import type { Quote } from '../../types/quote';
import {
  parseApiQuotesPayload,
  parseQuotesFromCsv,
  parseQuotesFromJson,
  quotesToCsv,
  quotesToJson,
} from '../quoteSerializer';

const SAMPLE: Quote[] = [
  {
    id: 'q-1',
    text: 'Pienso, "luego" existo.',
    author: 'René Descartes',
    year: 1637,
    country: 'Francia',
    tags: ['filosofía', 'razón'],
  },
  {
    id: 'q-2',
    text: 'La simplicidad es la máxima sofisticación.',
    author: 'Leonardo da Vinci',
    tags: ['arte'],
  },
];

test('quotesToJson and parseQuotesFromJson roundtrip preserves schema', () => {
  const json = quotesToJson(SAMPLE);
  const parsed = parseQuotesFromJson(json);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].text, 'Pienso, "luego" existo.');
  assert.equal(parsed[0].year, 1637);
  assert.equal(parsed[1].year, undefined);
});

test('quotesToCsv and parseQuotesFromCsv roundtrip handles commas and quotes', () => {
  const csv = quotesToCsv(SAMPLE);
  const parsed = parseQuotesFromCsv(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].text, 'Pienso, "luego" existo.');
  assert.deepEqual(parsed[0].tags, ['filosofía', 'razón']);
  assert.equal(parsed[1].country, undefined);
  assert.deepEqual(parsed[1].tags, ['arte']);
});

test('parseApiQuotesPayload supports DummyJSON-style { quotes: [...] }', () => {
  const payload = {
    quotes: [
      { id: 10, quote: 'La imaginación es poder.', author: 'Anónimo' },
    ],
  };
  const parsed = parseApiQuotesPayload(payload);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, '10');
  assert.equal(parsed[0].text, 'La imaginación es poder.');
  assert.deepEqual(parsed[0].tags, ['general']);
});

test('parseQuotesFromCsv throws descriptive error on invalid input', () => {
  assert.throws(() => parseQuotesFromCsv('id,text,author'), /al menos una fila/);
});
