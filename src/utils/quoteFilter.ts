import { Quote, QuoteFilters } from '../types/quote';

/**
 * Normaliza una cadena para comparaciones insensibles a mayúsculas y acentos.
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra la lista de citas según categorías seleccionadas (OR entre categorías)
 * y autor seleccionado (AND con las categorías).
 */
export function filterQuotes(quotes: Quote[], filters: QuoteFilters): Quote[] {
  const normalizedCategories = filters.categories.map(normalizeText);
  const normalizedAuthor = filters.author ? normalizeText(filters.author) : null;

  return quotes.filter((quote) => {
    const matchesAuthor =
      !normalizedAuthor || normalizeText(quote.author) === normalizedAuthor;

    if (!matchesAuthor) {
      return false;
    }

    if (normalizedCategories.length === 0) {
      return true;
    }

    const quoteTags = quote.tags.map(normalizeText);
    return normalizedCategories.some((cat) => quoteTags.includes(cat));
  });
}

/**
 * Obtiene todas las categorías únicas ordenadas alfabéticamente.
 */
export function extractCategories(quotes: Quote[]): string[] {
  const map = new Map<string, string>();
  for (const quote of quotes) {
    for (const tag of quote.tags) {
      const key = normalizeText(tag);
      if (!map.has(key)) {
        map.set(key, tag);
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Obtiene todos los autores únicos ordenados alfabéticamente.
 */
export function extractAuthors(quotes: Quote[]): string[] {
  const set = new Set<string>();
  for (const quote of quotes) {
    set.add(quote.author);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Selecciona una cita aleatoria diferente a `currentId` cuando hay más de una opción.
 */
export function pickNextQuote(
  filteredQuotes: Quote[],
  currentId: string | null,
  randomFn: () => number = Math.random
): Quote | null {
  if (filteredQuotes.length === 0) {
    return null;
  }
  if (filteredQuotes.length === 1) {
    return filteredQuotes[0];
  }

  const candidates = filteredQuotes.filter((q) => q.id !== currentId);
  const pool = candidates.length > 0 ? candidates : filteredQuotes;
  const index = Math.floor(randomFn() * pool.length) % pool.length;
  return pool[index];
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calcula los límites seguros (x, y) para que la ventana arrastrable
 * permanezca siempre dentro del área visible de la pantalla.
 */
export function computeSafeDragBounds(params: {
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  insetTop: number;
  insetBottom: number;
  insetLeft: number;
  insetRight: number;
  margin?: number;
}): Bounds {
  const margin = params.margin ?? 8;
  const minX = params.insetLeft + margin;
  const maxX = Math.max(
    minX,
    params.screenWidth - params.insetRight - params.windowWidth - margin
  );
  const minY = params.insetTop + margin;
  const maxY = Math.max(
    minY,
    params.screenHeight - params.insetBottom - params.windowHeight - margin
  );

  return { minX, maxX, minY, maxY };
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
