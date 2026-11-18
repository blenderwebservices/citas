import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import quotesData from '../data/quotes.json';
import { useQuotesStore } from '../store/useQuotesStore';
import { AppTheme } from '../theme/themes';
import { Quote } from '../types/quote';
import {
  extractAuthors,
  extractCategories,
  normalizeText,
} from '../utils/quoteFilter';

interface SettingsPanelProps {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
}

const ALL_QUOTES = quotesData as Quote[];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  theme,
  onClose,
}) => {
  const {
    theme: themeMode,
    selectedCategories,
    selectedAuthor,
    toggleTheme,
    toggleCategory,
    setSelectedAuthor,
    clearFilters,
    getFilteredQuotes,
  } = useQuotesStore();

  const [authorQuery, setAuthorQuery] = useState('');

  const categories = useMemo(() => extractCategories(ALL_QUOTES), []);
  const authors = useMemo(() => extractAuthors(ALL_QUOTES), []);

  const filteredAuthors = useMemo(() => {
    const q = normalizeText(authorQuery);
    if (!q) return authors;
    return authors.filter((author) => normalizeText(author).includes(q));
  }, [authors, authorQuery]);

  const matchingCount = getFilteredQuotes().length;
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAuthor !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="Cerrar ajustes tocando el fondo"
      >
        <Pressable
          style={[
            styles.panelOuter,
            {
              backgroundColor: theme.modalBg,
              borderTopColor: theme.bevelHighlight,
              borderLeftColor: theme.bevelHighlight,
              borderBottomColor: theme.bevelShadow,
              borderRightColor: theme.bevelShadow,
              shadowColor: theme.shadowColor,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.titleBarBg,
                borderBottomColor: theme.divider,
              },
            ]}
          >
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerIcon, { color: theme.accent }]}>
                ⚙
              </Text>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Ajustes y Filtros
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar ajustes"
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: theme.buttonBg,
                  borderTopColor: pressed
                    ? theme.buttonBorderDark
                    : theme.buttonBorderLight,
                  borderLeftColor: pressed
                    ? theme.buttonBorderDark
                    : theme.buttonBorderLight,
                  borderBottomColor: pressed
                    ? theme.buttonBorderLight
                    : theme.buttonBorderDark,
                  borderRightColor: pressed
                    ? theme.buttonBorderLight
                    : theme.buttonBorderDark,
                },
              ]}
            >
              <Text style={[styles.closeBtnText, { color: theme.textPrimary }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Theme Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                APARIENCIA
              </Text>
              <View
                style={[
                  styles.settingRow,
                  {
                    backgroundColor: theme.windowInnerBg,
                    borderTopColor: theme.innerBevelShadow,
                    borderLeftColor: theme.innerBevelShadow,
                    borderBottomColor: theme.innerBevelHighlight,
                    borderRightColor: theme.innerBevelHighlight,
                  },
                ]}
              >
                <View style={styles.settingLabelGroup}>
                  <Text style={[styles.themeIcon, { color: theme.accent }]}>
                    {themeMode === 'dark' ? '☾' : '☀'}
                  </Text>
                  <View>
                    <Text
                      style={[styles.settingLabel, { color: theme.textPrimary }]}
                    >
                      Modo Oscuro
                    </Text>
                    <Text
                      style={[
                        styles.settingSublabel,
                        { color: theme.textMuted },
                      ]}
                    >
                      Invierte el marco biselado en tiempo real
                    </Text>
                  </View>
                </View>
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.divider, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Category Filters */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                  CATEGORÍAS
                </Text>
                {hasActiveFilters && (
                  <Pressable onPress={clearFilters}>
                    <Text style={[styles.clearText, { color: theme.accent }]}>
                      Limpiar filtros
                    </Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.chipsGrid}>
                {categories.map((category) => {
                  const isSelected = selectedCategories.some(
                    (c) => normalizeText(c) === normalizeText(category)
                  );
                  return (
                    <Pressable
                      key={category}
                      onPress={() => toggleCategory(category)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? theme.accent
                            : theme.buttonBg,
                          borderTopColor: isSelected
                            ? theme.accent
                            : theme.buttonBorderLight,
                          borderLeftColor: isSelected
                            ? theme.accent
                            : theme.buttonBorderLight,
                          borderBottomColor: isSelected
                            ? theme.accent
                            : theme.buttonBorderDark,
                          borderRightColor: isSelected
                            ? theme.accent
                            : theme.buttonBorderDark,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipCheck,
                          {
                            color: isSelected
                              ? theme.accentText
                              : theme.textMuted,
                          },
                        ]}
                      >
                        {isSelected ? '☑' : '☐'}
                      </Text>
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected
                              ? theme.accentText
                              : theme.textPrimary,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Author Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                FILTRAR POR AUTOR
              </Text>
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.searchIcon, { color: theme.textMuted }]}>
                  ⌕
                </Text>
                <TextInput
                  value={authorQuery}
                  onChangeText={setAuthorQuery}
                  placeholder="Buscar autor..."
                  placeholderTextColor={theme.textMuted}
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                />
                {authorQuery.length > 0 && (
                  <Pressable onPress={() => setAuthorQuery('')}>
                    <Text style={[styles.clearInput, { color: theme.textMuted }]}>
                      ✕
                    </Text>
                  </Pressable>
                )}
              </View>

              <View
                style={[
                  styles.authorsList,
                  {
                    backgroundColor: theme.windowInnerBg,
                    borderTopColor: theme.innerBevelShadow,
                    borderLeftColor: theme.innerBevelShadow,
                    borderBottomColor: theme.innerBevelHighlight,
                    borderRightColor: theme.innerBevelHighlight,
                  },
                ]}
              >
                <ScrollView nestedScrollEnabled style={styles.authorsScroll}>
                  <Pressable
                    onPress={() => setSelectedAuthor(null)}
                    style={[
                      styles.authorItem,
                      { borderBottomColor: theme.divider },
                      selectedAuthor === null && {
                        backgroundColor: theme.tagBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.authorItemText,
                        {
                          color:
                            selectedAuthor === null
                              ? theme.accent
                              : theme.textPrimary,
                          fontWeight: selectedAuthor === null ? '600' : '400',
                        },
                      ]}
                    >
                      Todos los autores
                    </Text>
                    {selectedAuthor === null && (
                      <Text style={{ color: theme.accent, fontWeight: '700' }}>
                        ✓
                      </Text>
                    )}
                  </Pressable>

                  {filteredAuthors.map((author) => {
                    const isSelected = selectedAuthor === author;
                    return (
                      <Pressable
                        key={author}
                        onPress={() =>
                          setSelectedAuthor(isSelected ? null : author)
                        }
                        style={[
                          styles.authorItem,
                          { borderBottomColor: theme.divider },
                          isSelected && { backgroundColor: theme.tagBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.authorItemText,
                            {
                              color: isSelected
                                ? theme.accent
                                : theme.textPrimary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {author}
                        </Text>
                        {isSelected && (
                          <Text
                            style={{ color: theme.accent, fontWeight: '700' }}
                          >
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                  {filteredAuthors.length === 0 && (
                    <Text
                      style={[styles.emptyAuthors, { color: theme.textMuted }]}
                    >
                      No se encontraron autores con "{authorQuery}"
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>
          </ScrollView>

          {/* Footer status */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.divider,
                backgroundColor: theme.titleBarBg,
              },
            ]}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {matchingCount === 1
                ? '1 cita coincide con los filtros'
                : `${matchingCount} citas coinciden con los filtros`}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panelOuter: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    borderWidth: 2,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 2,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 1,
  },
  clearText: {
    fontWeight: '500',
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  themeIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  settingSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  chipCheck: {
    fontSize: 13,
  },
  chipText: {
    fontWeight: '500',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  clearInput: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  authorsList: {
    maxHeight: 170,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  authorsScroll: {
    maxHeight: 166,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  authorItemText: {
    fontSize: 13,
  },
  emptyAuthors: {
    fontSize: 12,
    textAlign: 'center',
    padding: 14,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
});
