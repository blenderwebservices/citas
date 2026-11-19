import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_SOURCE_OPTIONS } from '../services/quotesApi';
import { useQuotesStore } from '../store/useQuotesStore';
import { AppTheme } from '../theme/themes';
import { QuoteApiSource } from '../types/quote';
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

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  theme,
  onClose,
}) => {
  const {
    theme: themeMode,
    apiSource,
    selectedCategories,
    selectedAuthor,
    remoteQuotes,
    isSyncingRemote,
    setApiSource,
    syncRemoteQuotes,
    toggleTheme,
    toggleCategory,
    setSelectedAuthor,
    clearFilters,
    getActiveCatalog,
    getFilteredQuotes,
  } = useQuotesStore();

  const [authorQuery, setAuthorQuery] = useState('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const activeCatalog = getActiveCatalog();
  const categories = useMemo(() => extractCategories(activeCatalog), [activeCatalog]);
  const authors = useMemo(() => extractAuthors(activeCatalog), [activeCatalog]);

  const filteredAuthors = useMemo(() => {
    const q = normalizeText(authorQuery);
    if (!q) return authors;
    return authors.filter((author) => normalizeText(author).includes(q));
  }, [authors, authorQuery]);

  const matchingCount = getFilteredQuotes().length;
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAuthor !== null;

  const handleSyncPress = async () => {
    setSyncFeedback('Sincronizando...');
    const count = await syncRemoteQuotes();
    if (count > 0) {
      setSyncFeedback(`¡Listo! ${count} citas sincronizadas`);
    } else {
      setSyncFeedback('Sin conexión o error al conectar');
    }
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlayWrapper}>
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
                Ajustes y Fuente de Citas
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
            {/* Fuente de Citas / API */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                FUENTE DE CITAS (API)
              </Text>

              <View style={styles.apiList}>
                {API_SOURCE_OPTIONS.map((opt) => {
                  const isSelected = apiSource === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setApiSource(opt.id as QuoteApiSource)}
                      style={({ pressed }) => [
                        styles.apiOption,
                        {
                          backgroundColor: isSelected
                            ? theme.windowInnerBg
                            : theme.buttonBg,
                          borderTopColor: isSelected
                            ? theme.innerBevelShadow
                            : pressed
                            ? theme.buttonBorderDark
                            : theme.buttonBorderLight,
                          borderLeftColor: isSelected
                            ? theme.innerBevelShadow
                            : pressed
                            ? theme.buttonBorderDark
                            : theme.buttonBorderLight,
                          borderBottomColor: isSelected
                            ? theme.innerBevelHighlight
                            : pressed
                            ? theme.buttonBorderLight
                            : theme.buttonBorderDark,
                          borderRightColor: isSelected
                            ? theme.innerBevelHighlight
                            : pressed
                            ? theme.buttonBorderLight
                            : theme.buttonBorderDark,
                        },
                      ]}
                    >
                      <View style={styles.apiHeaderRow}>
                        <View style={styles.apiTitleGroup}>
                          <Text
                            style={[
                              styles.apiRadio,
                              { color: isSelected ? theme.accent : theme.textMuted },
                            ]}
                          >
                            {isSelected ? '●' : '○'}
                          </Text>
                          <Text
                            style={[
                              styles.apiName,
                              {
                                color: isSelected
                                  ? theme.accent
                                  : theme.textPrimary,
                              },
                            ]}
                          >
                            {opt.name}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: isSelected
                                ? theme.accent
                                : theme.divider,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : theme.textMuted,
                              },
                            ]}
                          >
                            {opt.badge}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[styles.apiDesc, { color: theme.textMuted }]}
                      >
                        {opt.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Botón de Sincronización para GitHub CDN */}
              {apiSource === 'github-cdn' && (
                <View style={styles.syncContainer}>
                  <Pressable
                    disabled={isSyncingRemote}
                    onPress={handleSyncPress}
                    style={({ pressed }) => [
                      styles.syncButton,
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
                    <Text style={[styles.syncButtonText, { color: theme.accent }]}>
                      {isSyncingRemote ? '⏳ Sincronizando catálogo...' : '↻ Sincronizar catálogo ahora'}
                    </Text>
                  </Pressable>
                  {syncFeedback && (
                    <Text
                      style={[styles.syncFeedback, { color: theme.accent }]}
                    >
                      {syncFeedback}
                    </Text>
                  )}
                  {remoteQuotes.length > 0 && !syncFeedback && (
                    <Text
                      style={[styles.syncFeedback, { color: theme.textMuted }]}
                    >
                      {remoteQuotes.length} citas disponibles en caché
                    </Text>
                  )}
                </View>
              )}

              {(apiSource === 'positive-api' || apiSource === 'zenquotes') && (
                <Text style={[styles.liveNote, { color: theme.textMuted }]}>
                  ⚡ Modo en vivo: cada vez que pulses [ ↻ ] en la ventana principal, se consultará una nueva cita directamente de la API.
                </Text>
              )}
            </View>

            {/* Apariencia */}
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

            {/* Filtros por Categorías */}
            {categories.length > 0 && (
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
                            styles.chipText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            },
                          ]}
                        >
                          #{category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Filtro por Autor */}
            {authors.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                  FILTRAR POR AUTOR
                </Text>

                <View
                  style={[
                    styles.searchBox,
                    {
                      backgroundColor: theme.windowInnerBg,
                      borderColor: theme.divider,
                    },
                  ]}
                >
                  <Text style={[styles.searchIcon, { color: theme.textMuted }]}>
                    🔍
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
                      <Text
                        style={[styles.clearInput, { color: theme.textMuted }]}
                      >
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
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.authorsScroll}
                    showsVerticalScrollIndicator
                  >
                    <Pressable
                      onPress={() => setSelectedAuthor(null)}
                      style={[
                        styles.authorItem,
                        {
                          borderBottomColor: theme.divider,
                          backgroundColor:
                            selectedAuthor === null
                              ? theme.accent + '22'
                              : 'transparent',
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
                            fontWeight:
                              selectedAuthor === null ? '700' : '400',
                          },
                        ]}
                      >
                        Todos los autores
                      </Text>
                      {selectedAuthor === null && (
                        <Text style={{ color: theme.accent }}>✓</Text>
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
                            {
                              borderBottomColor: theme.divider,
                              backgroundColor: isSelected
                                ? theme.accent + '22'
                                : 'transparent',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.authorItemText,
                              {
                                color: isSelected
                                  ? theme.accent
                                  : theme.textPrimary,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}
                          >
                            {author}
                          </Text>
                          {isSelected && (
                            <Text style={{ color: theme.accent }}>✓</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.titleBarBg,
                borderTopColor: theme.divider,
              },
            ]}
          >
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              {matchingCount > 0
                ? `${matchingCount} citas coinciden con los filtros actuales`
                : 'Ninguna cita coincide con los filtros'}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panelOuter: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
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
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  closeBtn: {
    borderWidth: 1.5,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  closeBtnText: {
    fontWeight: '700',
    fontSize: 11,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  apiList: {
    gap: 8,
  },
  apiOption: {
    borderWidth: 1.5,
    borderRadius: 3,
    padding: 10,
    gap: 4,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apiTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiRadio: {
    fontSize: 14,
  },
  apiName: {
    fontWeight: '700',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  apiDesc: {
    fontSize: 11,
    lineHeight: 15,
    paddingLeft: 22,
  },
  syncContainer: {
    marginTop: 4,
    gap: 4,
  },
  syncButton: {
    borderWidth: 1.5,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  syncButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  syncFeedback: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  liveNote: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeIcon: {
    fontSize: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  chipText: {
    fontWeight: '500',
    fontSize: 12,
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
    fontSize: 14,
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
    maxHeight: 150,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  authorsScroll: {
    maxHeight: 146,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  authorItemText: {
    fontSize: 12,
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
