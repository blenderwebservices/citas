import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import quotesData from '../data/quotes.json';
import {
  fetchGitHubCatalog,
  fetchPositiveQuote,
  fetchZenQuote,
} from '../services/quotesApi';
import { Quote, QuoteApiSource, ThemeMode } from '../types/quote';
import { filterQuotes, normalizeText, pickNextQuote } from '../utils/quoteFilter';

const ALL_LOCAL_QUOTES: Quote[] = quotesData as Quote[];

interface QuotesState {
  theme: ThemeMode;
  apiSource: QuoteApiSource;
  selectedCategories: string[];
  selectedAuthor: string | null;
  currentQuoteId: string | null;
  currentDynamicQuote: Quote | null;
  remoteQuotes: Quote[];
  isLoadingQuote: boolean;
  isSyncingRemote: boolean;
  isWindowVisible: boolean;
  isSettingsOpen: boolean;

  setApiSource: (source: QuoteApiSource) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleCategory: (category: string) => void;
  setSelectedAuthor: (author: string | null) => void;
  clearFilters: () => void;
  nextQuote: () => Promise<void>;
  syncRemoteQuotes: () => Promise<number>;
  setWindowVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  getActiveCatalog: () => Quote[];
  getFilteredQuotes: () => Quote[];
  getCurrentQuote: () => Quote | null;
}

function resolveCurrentAfterFilterChange(
  pool: Quote[],
  categories: string[],
  author: string | null,
  previousId: string | null
): string | null {
  const filtered = filterQuotes(pool, { categories, author });
  if (filtered.length === 0) {
    return null;
  }
  if (previousId && filtered.some((q) => q.id === previousId)) {
    return previousId;
  }
  return pickNextQuote(filtered, previousId)?.id ?? filtered[0].id;
}

export const useQuotesStore = create<QuotesState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      apiSource: 'local',
      selectedCategories: [],
      selectedAuthor: null,
      currentQuoteId: ALL_LOCAL_QUOTES[0]?.id ?? null,
      currentDynamicQuote: null,
      remoteQuotes: [],
      isLoadingQuote: false,
      isSyncingRemote: false,
      isWindowVisible: true,
      isSettingsOpen: false,

      setApiSource: (source: QuoteApiSource) => {
        set({ apiSource: source, currentDynamicQuote: null });
        if (source === 'github-cdn' && get().remoteQuotes.length === 0) {
          get().syncRemoteQuotes();
        } else if (source === 'positive-api' || source === 'zenquotes') {
          get().nextQuote();
        }
      },

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),

      toggleCategory: (category) =>
        set((state) => {
          const pool = get().getActiveCatalog();
          const target = normalizeText(category);
          const exists = state.selectedCategories.some(
            (c) => normalizeText(c) === target
          );
          const nextCategories = exists
            ? state.selectedCategories.filter((c) => normalizeText(c) !== target)
            : [...state.selectedCategories, category];

          return {
            selectedCategories: nextCategories,
            currentDynamicQuote: null,
            currentQuoteId: resolveCurrentAfterFilterChange(
              pool,
              nextCategories,
              state.selectedAuthor,
              state.currentQuoteId
            ),
          };
        }),

      setSelectedAuthor: (author) =>
        set((state) => {
          const pool = get().getActiveCatalog();
          return {
            selectedAuthor: author,
            currentDynamicQuote: null,
            currentQuoteId: resolveCurrentAfterFilterChange(
              pool,
              state.selectedCategories,
              author,
              state.currentQuoteId
            ),
          };
        }),

      clearFilters: () =>
        set((state) => {
          const pool = get().getActiveCatalog();
          return {
            selectedCategories: [],
            selectedAuthor: null,
            currentDynamicQuote: null,
            currentQuoteId: resolveCurrentAfterFilterChange(
              pool,
              [],
              null,
              state.currentQuoteId
            ),
          };
        }),

      nextQuote: async () => {
        const { apiSource } = get();

        // 1. Consulta en vivo para The Positive API
        if (apiSource === 'positive-api') {
          set({ isLoadingQuote: true });
          const fetched = await fetchPositiveQuote();
          set({ isLoadingQuote: false });
          if (fetched) {
            set({ currentDynamicQuote: fetched });
            return;
          }
          // Si falla, recurre al catálogo local
        }

        // 2. Consulta en vivo para ZenQuotes API
        if (apiSource === 'zenquotes') {
          set({ isLoadingQuote: true });
          const fetched = await fetchZenQuote();
          set({ isLoadingQuote: false });
          if (fetched) {
            set({ currentDynamicQuote: fetched });
            return;
          }
          // Si falla, recurre al catálogo local
        }

        // 3. Catálogo local o GitHub CDN
        const pool = get().getActiveCatalog();
        const { selectedCategories, selectedAuthor, currentQuoteId } = get();
        const filtered = filterQuotes(pool, {
          categories: selectedCategories,
          author: selectedAuthor,
        });
        const next = pickNextQuote(filtered, currentQuoteId);
        set({
          currentDynamicQuote: null,
          currentQuoteId: next ? next.id : pool[0]?.id ?? null,
        });
      },

      syncRemoteQuotes: async () => {
        set({ isSyncingRemote: true });
        const quotes = await fetchGitHubCatalog();
        if (quotes.length > 0) {
          set({
            remoteQuotes: quotes,
            isSyncingRemote: false,
            currentDynamicQuote: null,
            currentQuoteId: quotes[0]?.id ?? null,
          });
          return quotes.length;
        }
        set({ isSyncingRemote: false });
        return 0;
      },

      setWindowVisible: (visible) =>
        set({
          isWindowVisible: visible,
          ...(visible ? {} : { isSettingsOpen: false }),
        }),

      setSettingsOpen: (open) => set({ isSettingsOpen: open }),

      getActiveCatalog: () => {
        const { apiSource, remoteQuotes } = get();
        if (apiSource === 'github-cdn' && remoteQuotes.length > 0) {
          return remoteQuotes;
        }
        return ALL_LOCAL_QUOTES;
      },

      getFilteredQuotes: () => {
        const { selectedCategories, selectedAuthor } = get();
        const pool = get().getActiveCatalog();
        return filterQuotes(pool, {
          categories: selectedCategories,
          author: selectedAuthor,
        });
      },

      getCurrentQuote: () => {
        const { currentDynamicQuote, currentQuoteId, apiSource } = get();
        if (
          (apiSource === 'positive-api' || apiSource === 'zenquotes') &&
          currentDynamicQuote
        ) {
          return currentDynamicQuote;
        }
        const pool = get().getActiveCatalog();
        const { selectedCategories, selectedAuthor } = get();
        const filtered = filterQuotes(pool, {
          categories: selectedCategories,
          author: selectedAuthor,
        });
        if (filtered.length === 0) {
          return pool[0] ?? null;
        }
        return (
          filtered.find((q) => q.id === currentQuoteId) ??
          filtered[0] ??
          ALL_LOCAL_QUOTES[0] ??
          null
        );
      },
    }),
    {
      name: 'citas-celebres-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        apiSource: state.apiSource,
        selectedCategories: state.selectedCategories,
        selectedAuthor: state.selectedAuthor,
        remoteQuotes: state.remoteQuotes,
      }),
    }
  )
);
