import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { BeveledWindow } from './src/components/BeveledWindow';
import { RestoreWindowButton } from './src/components/RestoreWindowButton';
import { SettingsPanel } from './src/components/SettingsPanel';
import { useQuotesStore } from './src/store/useQuotesStore';
import { themes } from './src/theme/themes';
import type { ThemeMode } from './src/types/quote';

export default function App() {
  const systemScheme = useColorScheme();
  const {
    themePreference,
    apiSource,
    isLoadingQuote,
    selectedCategories,
    selectedAuthor,
    isWindowVisible,
    isSettingsOpen,
    nextQuote,
    setWindowVisible,
    setSettingsOpen,
    clearFilters,
    getCurrentQuote,
  } = useQuotesStore();

  const resolvedMode: ThemeMode =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  const activeTheme = themes[resolvedMode];
  const currentQuote = getCurrentQuote();
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAuthor !== null;

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <StatusBar
        barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      {!isWindowVisible && (
        <View style={styles.restoreWrapper} pointerEvents="box-none">
          <RestoreWindowButton
            theme={activeTheme}
            onRestore={() => setWindowVisible(true)}
          />
        </View>
      )}

      {isWindowVisible && (
        <BeveledWindow
          quote={currentQuote}
          theme={activeTheme}
          hasActiveFilters={hasActiveFilters}
          apiSource={apiSource}
          isLoadingQuote={isLoadingQuote}
          onNextQuote={nextQuote}
          onOpenSettings={() => setSettingsOpen(true)}
          onClose={() => setWindowVisible(false)}
          onClearFilters={clearFilters}
        />
      )}

      <SettingsPanel
        visible={isSettingsOpen}
        theme={activeTheme}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  restoreWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
