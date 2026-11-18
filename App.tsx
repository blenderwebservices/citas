import React from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { BeveledWindow } from './src/components/BeveledWindow';
import { RestoreWindowButton } from './src/components/RestoreWindowButton';
import { SettingsPanel } from './src/components/SettingsPanel';
import { useQuotesStore } from './src/store/useQuotesStore';
import { themes } from './src/theme/themes';

export default function App() {
  const {
    theme: themeMode,
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

  const handleBackdropPress = () => {
    if (isSettingsOpen) {
      setSettingsOpen(false);
    } else if (!isWindowVisible) {
      setWindowVisible(true);
    }
  };

  return (
    <Pressable
      onPress={handleBackdropPress}
      style={[styles.backdrop, { backgroundColor: activeTheme.backdrop }]}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  restoreWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
