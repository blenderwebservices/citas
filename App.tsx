import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { BeveledWindow } from './src/components/BeveledWindow';
import { RestoreWindowButton } from './src/components/RestoreWindowButton';
import { useQuotesStore } from './src/store/useQuotesStore';
import { themes } from './src/theme/themes';
import { closeApp } from './src/utils/windowControl';

export default function App() {
  const {
    theme: themeMode,
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

  const activeTheme = themes[themeMode];
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
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
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
