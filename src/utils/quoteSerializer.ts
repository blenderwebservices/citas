import type { Quote } from '../types/quote';

/**
 * Normaliza un objeto arbitrario (por ejemplo de JSON importado o de una API externa)
 * al esquema `Quote`. Devuelve `null` si faltan `text` o `author`.
 */
export function normalizeRawQuote(
  raw: Record<string, unknown>,
  fallbackIndex = 0
): Quote | null {
  const rawText = raw.text ?? raw.quote ?? raw.content ?? raw.q;
  const rawAuthor = raw.author ?? raw.a;

  if (typeof rawText !== 'string' || rawText.trim() === '') {
    return null;
  }
  if (typeof rawAuthor !== 'string' || rawAuthor.trim() === '') {
    return null;
  }

  const idValue =
    raw.id !== undefined && raw.id !== null && String(raw.id).trim() !== ''
      ? String(raw.id).trim()
      : `imp-${Date.now()}-${fallbackIndex}`;

  const yearRaw = raw.year;
  const year =
    yearRaw !== undefined && yearRaw !== null && String(yearRaw).trim() !== ''
      ? typeof yearRaw === 'number'
        ? yearRaw
        : String(yearRaw).trim()
      : undefined;

  const countryRaw = raw.country;
  const country =
    typeof countryRaw === 'string' && countryRaw.trim() !== ''
      ? countryRaw.trim()
      : undefined;

  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
  } else if (typeof raw.tags === 'string' && raw.tags.trim() !== '') {
    tags = raw.tags
      .split(/[|;,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  if (tags.length === 0) {
    tags = ['general'];
  }

  return {
    id: idValue,
    text: rawText.trim(),
    author: rawAuthor.trim(),
    ...(year !== undefined ? { year } : {}),
    ...(country !== undefined ? { country } : {}),
    tags,
  };
}

/**
 * Serializa citas a JSON formateado.
 */
export function quotesToJson(quotes: Quote[]): string {
  return JSON.stringify(quotes, null, 2);
}

/**
 * Escapa un campo para CSV según RFC 4180.
 */
function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serializa citas a CSV con encabezados `id,text,author,year,country,tags`.
 * Las etiquetas se unen con `|`.
 */
export function quotesToCsv(quotes: Quote[]): string {
  const header = 'id,text,author,year,country,tags';
  const rows = quotes.map((q) => {
    const cols = [
      q.id,
      q.text,
      q.author,
      q.year !== undefined ? String(q.year) : '',
      q.country ?? '',
      q.tags.join('|'),
    ];
    return cols.map(escapeCsvField).join(',');
  });
  return [header, ...rows].join('\n');
}

/**
 * Parsea un payload JSON (array directo o `{ quotes: [...] }`) en `Quote[]`.
 */
export function parseQuotesFromJson(input: string): Quote[] {
  const parsed: unknown = JSON.parse(input);
  return parseApiQuotesPayload(parsed);
}

/**
 * Parsea la respuesta JSON de una API de citas (`[...]`, `{ quotes: [...] }`, `{ data: [...] }`).
 */
export function parseApiQuotesPayload(payload: unknown): Quote[] {
  let items: unknown[] | null = null;
  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.quotes)) {
      items = obj.quotes;
    } else if (Array.isArray(obj.data)) {
      items = obj.data;
    } else if (Array.isArray(obj.results)) {
      items = obj.results;
    }
  }

  if (!items) {
    throw new Error(
      'Formato JSON no reconocido. Se esperaba un arreglo de citas o un objeto con "quotes".'
    );
  }

  const normalized = items
    .map((item, idx) =>
      item && typeof item === 'object'
        ? normalizeRawQuote(item as Record<string, unknown>, idx)
        : null
    )
    .filter((q): q is Quote => q !== null);

  if (normalized.length === 0) {
    throw new Error('No se encontraron citas válidas en el contenido JSON.');
  }

  return normalized;
}

/**
 * Parsea texto CSV completo (soportando comillas dobles y saltos de línea dentro de comillas).
 */
function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

/**
 * Parsea citas desde CSV con encabezados (`text`, `author`, opcionales `id`, `year`, `country`, `tags`).
 */
export function parseQuotesFromCsv(csvText: string): Quote[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('El CSV debe incluir encabezados y al menos una fila.');
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const quotes: Quote[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const record: Record<string, unknown> = {};
    headers.forEach((header, colIdx) => {
      if (header) {
        record[header] = values[colIdx] ?? '';
      }
    });

    const quote = normalizeRawQuote(record, i);
    if (quote) {
      quotes.push(quote);
    }
  }

  if (quotes.length === 0) {
    throw new Error(
      'No se encontraron citas válidas en el CSV. Verifica las columnas "text" y "author".'
    );
  }

  return quotes;
}
