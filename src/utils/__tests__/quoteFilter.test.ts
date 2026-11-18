import assert from 'node:assert/strict';
import test from 'node:test';
import { Quote } from '../../types/quote';
import {
  clampValue,
  computeSafeDragBounds,
  extractAuthors,
  extractCategories,
  filterQuotes,
  pickNextQuote,
} from '../quoteFilter';

const SAMPLE_QUOTES: Quote[] = [
  {
    id: '1',
    text: 'Solo sé que no sé nada.',
    author: 'Sócrates',
    year: 'Siglo V a.C.',
    country: 'Grecia',
    tags: ['filosofía', 'sabiduría'],
  },
  {
    id: '2',
    text: 'La imaginación es más importante que el conocimiento.',
    author: 'Albert Einstein',
    year: 1929,
    country: 'Alemania',
    tags: ['ciencia', 'creatividad'],
  },
  {
    id: '3',
    text: 'La medida de la inteligencia es la capacidad de cambiar.',
    author: 'Albert Einstein',
    tags: ['ciencia', 'sabiduría'],
  },
];

test('filterQuotes returns all quotes when no filters are active', () => {
  const result = filterQuotes(SAMPLE_QUOTES, { categories: [], author: null });
  assert.equal(result.length, 3);
});

test('filterQuotes filters by category case- and accent-insensitively', () => {
  const result = filterQuotes(SAMPLE_QUOTES, {
    categories: ['FILOSOFIA'],
    author: null,
  });
  assert.deepEqual(
    result.map((q) => q.id),
    ['1']
  );
});

test('filterQuotes combines category and author filters and handles empty states', () => {
  const matching = filterQuotes(SAMPLE_QUOTES, {
    categories: ['ciencia'],
    author: 'Albert Einstein',
  });
  assert.deepEqual(
    matching.map((q) => q.id),
    ['2', '3']
  );

  const empty = filterQuotes(SAMPLE_QUOTES, {
    categories: ['filosofía'],
    author: 'Albert Einstein',
  });
  assert.equal(empty.length, 0);
});

test('extractCategories and extractAuthors return sorted unique lists', () => {
  assert.deepEqual(extractAuthors(SAMPLE_QUOTES), [
    'Albert Einstein',
    'Sócrates',
  ]);
  assert.deepEqual(extractCategories(SAMPLE_QUOTES), [
    'ciencia',
    'creatividad',
    'filosofía',
    'sabiduría',
  ]);
});

test('pickNextQuote avoids repeating currentId when multiple candidates exist', () => {
  const next = pickNextQuote(SAMPLE_QUOTES, '1', () => 0);
  if (!next) {
    assert.fail('Expected a next quote');
  }
  assert.notEqual(next.id, '1');

  const single = pickNextQuote([SAMPLE_QUOTES[0]], '1', () => 0);
  assert.equal(single?.id, '1');

  const none = pickNextQuote([], '1', () => 0);
  assert.equal(none, null);
});

test('computeSafeDragBounds keeps window inside safe screen area', () => {
  const bounds = computeSafeDragBounds({
    screenWidth: 390,
    screenHeight: 844,
    windowWidth: 340,
    windowHeight: 280,
    insetTop: 47,
    insetBottom: 34,
    insetLeft: 0,
    insetRight: 0,
    margin: 10,
  });

  assert.equal(bounds.minX, 10);
  assert.equal(bounds.maxX, 40);
  assert.equal(bounds.minY, 57);
  assert.equal(bounds.maxY, 520);
  assert.equal(clampValue(-100, bounds.minX, bounds.maxX), 10);
  assert.equal(clampValue(999, bounds.minY, bounds.maxY), 520);
});
