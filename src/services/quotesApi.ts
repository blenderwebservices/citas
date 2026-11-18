import { ApiSourceOption, Quote, QuoteApiSource } from '../types/quote';

export const API_SOURCE_OPTIONS: ApiSourceOption[] = [
  {
    id: 'local',
    name: 'Catálogo Local',
    description: 'Catálogo curado incluido en la app. 100% offline y rápido.',
    lang: 'es',
    badge: 'Offline',
  },
  {
    id: 'github-cdn',
    name: 'GitHub CDN (Híbrido)',
    description: 'Catálogo dinámico en español sincronizado desde repositorio abierto.',
    lang: 'es',
    badge: 'CDN',
  },
  {
    id: 'positive-api',
    name: 'The Positive API',
    description: 'Frases y citas en español en vivo desde positive-api.online.',
    lang: 'es',
    badge: 'API ES',
  },
  {
    id: 'zenquotes',
    name: 'ZenQuotes API',
    description: 'Citas célebres internacionales de autores globales en inglés.',
    lang: 'en',
    badge: 'API EN',
  },
];

const KNOWN_AUTHORS_MAP: Record<number, string> = {
  1: 'Anónimo',
  2: 'Albert Einstein',
  3: 'Marco Aurelio',
  4: 'Séneca',
  5: 'Confucio',
  6: 'Aristóteles',
  7: 'Frida Kahlo',
  8: 'Gabriela Mistral',
  9: 'Julio Cortázar',
  10: 'Gabriel García Márquez',
  11: 'Jorge Luis Borges',
  12: 'Pablo Neruda',
  13: 'Miguel de Cervantes',
  14: 'Octavio Paz',
};

async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Recupera el catálogo extendido en español alojado en GitHub CDN (Sugerencia 3)
 */
export async function fetchGitHubCatalog(): Promise<Quote[]> {
  try {
    const res = await fetchWithTimeout(
      'https://raw.githubusercontent.com/davr59/spanish-quotes/master/data/quotes.json',
      4500
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Array<{ quote: string; from?: string }> = await res.json();
    return data
      .filter((item) => item.quote && item.quote.trim().length > 0)
      .map((item, idx) => ({
        id: `gh-cdn-${idx + 1}`,
        text: item.quote.trim(),
        author: (item.from && item.from.trim()) || 'Anónimo',
        tags: ['literatura', 'filosofía', 'motivación'],
      }));
  } catch (error) {
    console.warn('[quotesApi] Error al descargar catálogo de GitHub CDN:', error);
    return [];
  }
}

/**
 * Consulta The Positive API (español)
 */
export async function fetchPositiveQuote(): Promise<Quote | null> {
  try {
    const res = await fetchWithTimeout('https://positive-api.online/phrase/esp', 3500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data.text) return null;

    const authorName =
      (data.author_id && KNOWN_AUTHORS_MAP[data.author_id]) ||
      'Autor Célebre';

    return {
      id: `pos-${data.id || Date.now()}`,
      text: data.text.trim(),
      author: authorName,
      tags: ['inspiración', 'reflexión'],
    };
  } catch (error) {
    console.warn('[quotesApi] Error al consultar The Positive API:', error);
    return null;
  }
}

/**
 * Consulta ZenQuotes API (internacional / inglés)
 */
export async function fetchZenQuote(): Promise<Quote | null> {
  try {
    const res = await fetchWithTimeout('https://zenquotes.io/api/random', 3500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data[0] && data[0].q) {
      return {
        id: `zen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: data[0].q.trim(),
        author: data[0].a ? data[0].a.trim() : 'Unknown',
        tags: ['universal', 'filosofía'],
      };
    }
    return null;
  } catch (error) {
    console.warn('[quotesApi] Error al consultar ZenQuotes API:', error);
    return null;
  }
}
