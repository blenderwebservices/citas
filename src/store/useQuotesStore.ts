import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import quotesData from '../data/quotes.json';
import { Quote, ThemeMode } from '../types/quote';
import { filterQuotes, normalizeText, pickNextQuote } from '../utils/quoteFilter';

const ALL_QUOTES: Quote[] = quotesData as Quote[];

interface QuotesState {
  theme: ThemeMode;
  selectedCategories: string[];
  selectedAuthor: string | null;
  currentQuoteId: string | null;
  isWindowVisible: boolean;
  isSettingsOpen: boolean;

  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleCategory: (category: string) => void;
  setSelectedAuthor: (author: string | null) => void;
  clearFilters: () => void;
  nextQuote: () => void;
  setWindowVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  getFilteredQuotes: () => Quote[];
  getCurrentQuote: () => Quote | null;
}

function resolveCurrentAfterFilterChange(
  categories: string[],
  author: string | null,
  previousId: string | null
): string | null {
  const filtered = filterQuotes(ALL_QUOTES, { categories, author });
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
      selectedCategories: [],
      selectedAuthor: null,
      currentQuoteId: ALL_QUOTES[0]?.id ?? null,
      isWindowVisible: true,
      isSettingsOpen: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),

      toggleCategory: (category) =>
        set((state) => {
          const target = normalizeText(category);
          const exists = state.selectedCategories.some(
            (c) => normalizeText(c) === target
          );
          const nextCategories = exists
            ? state.selectedCategories.filter((c) => normalizeText(c) !== target)
            : [...state.selectedCategories, category];

          return {
            selectedCategories: nextCategories,
            currentQuoteId: resolveCurrentAfterFilterChange(
              nextCategories,
              state.selectedAuthor,
              state.currentQuoteId
            ),
          };
        }),

      setSelectedAuthor: (author) =>
        set((state) => ({
          selectedAuthor: author,
          currentQuoteId: resolveCurrentAfterFilterChange(
            state.selectedCategories,
            author,
            state.currentQuoteId
          ),
        })),

      clearFilters: () =>
        set((state) => ({
          selectedCategories: [],
          selectedAuthor: null,
          currentQuoteId: resolveCurrentAfterFilterChange(
            [],
            null,
            state.currentQuoteId
          ),
        })),

      nextQuote: () =>
        set((state) => {
          const filtered = filterQuotes(ALL_QUOTES, {
            categories: state.selectedCategories,
            author: state.selectedAuthor,
          });
          const next = pickNextQuote(filtered, state.currentQuoteId);
          return { currentQuoteId: next ? next.id : null };
        }),

      setWindowVisible: (visible) =>
        set({
          isWindowVisible: visible,
          ...(visible ? {} : { isSettingsOpen: false }),
        }),

      setSettingsOpen: (open) => set({ isSettingsOpen: open }),

      getFilteredQuotes: () => {
        const { selectedCategories, selectedAuthor } = get();
        return filterQuotes(ALL_QUOTES, {
          categories: selectedCategories,
          author: selectedAuthor,
        });
      },

      getCurrentQuote: () => {
        const { currentQuoteId, selectedCategories, selectedAuthor } = get();
        const filtered = filterQuotes(ALL_QUOTES, {
          categories: selectedCategories,
          author: selectedAuthor,
        });
        if (filtered.length === 0) {
          return null;
        }
        return filtered.find((q) => q.id === currentQuoteId) ?? filtered[0];
      },
    }),
    {
      name: 'citas-celebres-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        selectedCategories: state.selectedCategories,
        selectedAuthor: state.selectedAuthor,
      }),
    }
  )
);
