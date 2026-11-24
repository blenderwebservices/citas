import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { BeveledWindow } from './src/components/BeveledWindow';
import { RestoreWindowButton } from './src/components/RestoreWindowButton';
import { useQuotesStore } from './src/store/useQuotesStore';
import { themes } from './src/theme/themes';
import { closeApp, setAlwaysOnTop } from './src/utils/windowControl';
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
    isAlwaysOnTop,
    isTimerActive,
    timerIntervalMinutes,
    nextQuote,
    setWindowVisible,
    setSettingsOpen,
    clearFilters,
    getCurrentQuote,
  } = useQuotesStore();

  useEffect(() => {
    setAlwaysOnTop(isAlwaysOnTop);
  }, [isAlwaysOnTop]);

  useEffect(() => {
    if (!isTimerActive) return;

    const intervalMs = Math.max(1, timerIntervalMinutes) * 60 * 1000;
    const intervalId = setInterval(() => {
      nextQuote();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isTimerActive, timerIntervalMinutes, nextQuote]);

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

  const handleCloseApp = () => {
    closeApp();
    setWindowVisible(false);
  };

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
          isSettingsOpen={isSettingsOpen}
          onNextQuote={nextQuote}
          onOpenSettings={() => setSettingsOpen(true)}
          onCloseSettings={() => setSettingsOpen(false)}
          onClose={handleCloseApp}
          onClearFilters={clearFilters}
        />
      )}
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
