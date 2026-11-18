export type ThemeMode = 'light' | 'dark';

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
