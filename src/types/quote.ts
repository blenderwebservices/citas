export type ThemeMode = 'light' | 'dark';

export type ThemePreference = ThemeMode | 'system';

export type QuoteFileFormat = 'json' | 'csv';

export type QuoteApiSource = 'local' | 'github-cdn' | 'positive-api' | 'zenquotes';

export interface ApiSourceOption {
  id: QuoteApiSource;
  name: string;
  description: string;
  lang: 'es' | 'en' | 'mixed';
  badge: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  year?: string | number;
  country?: string;
  tags: string[];
}

export interface QuoteFilters {
  categories: string[];
  author: string | null;
}
