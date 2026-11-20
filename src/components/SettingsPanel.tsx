import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_SOURCE_OPTIONS } from '../services/quotesApi';
import { useQuotesStore } from '../store/useQuotesStore';
import { AppTheme } from '../theme/themes';
import {
  QuoteApiSource,
  QuoteFileFormat,
  ThemePreference,
} from '../types/quote';
import {
  extractAuthors,
  extractCategories,
  normalizeText,
} from '../utils/quoteFilter';
import {
  parseQuotesFromCsv,
  parseQuotesFromJson,
  quotesToCsv,
  quotesToJson,
} from '../utils/quoteSerializer';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] =
  [
    { value: 'light', label: 'Claro', icon: '☀' },
    { value: 'dark', label: 'Oscuro', icon: '☾' },
    { value: 'system', label: 'Sistema', icon: '◐' },
  ];

const FORMAT_OPTIONS: { value: QuoteFileFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
];

export interface SettingsContentProps {
  theme: AppTheme;
  onClose?: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  theme,
  onClose,
}) => {
  const {
    themePreference,
    apiSource,
    selectedCategories,
    selectedAuthor,
    remoteQuotes,
    isSyncingRemote,
    setApiSource,
    syncRemoteQuotes,
    setThemePreference,
    importQuotes,
    resetLocalQuotes,
    toggleCategory,
    setSelectedAuthor,
    clearFilters,
    getActiveCatalog,
    getFilteredQuotes,
  } = useQuotesStore();

  const [authorQuery, setAuthorQuery] = useState('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [transferFormat, setTransferFormat] =
    useState<QuoteFileFormat>('json');
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [transferFeedback, setTransferFeedback] = useState<{
    type: 'ok' | 'error';
    message: string;
  } | null>(null);
  const [isFetchingFileUrl, setIsFetchingFileUrl] = useState(false);

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

  const handleExport = async () => {
    const quotesToExport =
      matchingCount > 0 ? getFilteredQuotes() : activeCatalog;
    const serialized =
      transferFormat === 'json'
        ? quotesToJson(quotesToExport)
        : quotesToCsv(quotesToExport);

    setExportPreview(serialized);
    setTransferFeedback({
      type: 'ok',
      message: `${quotesToExport.length} citas preparadas en ${transferFormat.toUpperCase()}.`,
    });

    try {
      await Share.share({
        title: `citas.${transferFormat}`,
        message: serialized,
      });
    } catch {
      // Share sheet cancelado o no disponible
    }
  };

  const handleImportFromText = (rawContent: string) => {
    const trimmed = rawContent.trim();
    if (!trimmed) {
      setTransferFeedback({
        type: 'error',
        message: 'Pega contenido JSON o CSV antes de importar.',
      });
      return;
    }

    try {
      const parsed =
        transferFormat === 'json'
          ? parseQuotesFromJson(trimmed)
          : parseQuotesFromCsv(trimmed);

      importQuotes(parsed, importMode);
      setImportText('');
      setTransferFeedback({
        type: 'ok',
        message: `Se cargaron ${parsed.length} citas desde ${transferFormat.toUpperCase()} (${importMode === 'replace' ? 'reemplazo' : 'agregadas'}).`,
      });
    } catch (err) {
      setTransferFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo procesar el archivo.',
      });
    }
  };

  const handleImportFromUrl = async () => {
    const url = importUrl.trim();
    if (!url) {
      setTransferFeedback({
        type: 'error',
        message: 'Ingresa una URL válida de JSON o CSV.',
      });
      return;
    }

    setIsFetchingFileUrl(true);
    setTransferFeedback(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      handleImportFromText(text);
    } catch (err) {
      setTransferFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? `Error al descargar: ${err.message}`
            : 'No se pudo descargar el archivo.',
      });
    } finally {
      setIsFetchingFileUrl(false);
    }
  };

  return (
    <View style={styles.contentRoot}>
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
                          {
                            color: isSelected
                              ? theme.accent
                              : theme.textMuted,
                          },
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
                          backgroundColor:
                            opt.badge === 'Offline'
                              ? theme.tagBg
                              : theme.buttonBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              opt.badge === 'Offline'
                                ? theme.tagText
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
              ⚡ Modo en vivo: cada vez que pulses [ ↻ ] se consultará una nueva cita directamente de la API.
            </Text>
          )}
        </View>

        {/* Apariencia: Claro / Oscuro / Sistema */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            TEMA VISUAL
          </Text>
          <View style={styles.segmentedRow}>
            {THEME_OPTIONS.map((opt) => {
              const isActive = themePreference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setThemePreference(opt.value)}
                  style={[
                    styles.segmentedBtn,
                    {
                      backgroundColor: isActive
                        ? theme.accent
                        : theme.buttonBg,
                      borderTopColor: isActive
                        ? theme.accent
                        : theme.buttonBorderLight,
                      borderLeftColor: isActive
                        ? theme.accent
                        : theme.buttonBorderLight,
                      borderBottomColor: isActive
                        ? theme.accent
                        : theme.buttonBorderDark,
                      borderRightColor: isActive
                        ? theme.accent
                        : theme.buttonBorderDark,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      {
                        color: isActive
                          ? theme.accentText
                          : theme.textPrimary,
                      },
                    ]}
                  >
                    {opt.icon} {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Cargar y Respaldar Citas (JSON / CSV) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            CARGAR / RESPALDAR CITAS
          </Text>

          <View
            style={[
              styles.cardBox,
              {
                backgroundColor: theme.windowInnerBg,
                borderTopColor: theme.innerBevelShadow,
                borderLeftColor: theme.innerBevelShadow,
                borderBottomColor: theme.innerBevelHighlight,
                borderRightColor: theme.innerBevelHighlight,
              },
            ]}
          >
            <View style={styles.segmentedRow}>
              {FORMAT_OPTIONS.map((opt) => {
                const isActive = transferFormat === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      setTransferFormat(opt.value);
                      setExportPreview(null);
                    }}
                    style={[
                      styles.segmentedBtn,
                      {
                        backgroundColor: isActive
                          ? theme.accent
                          : theme.buttonBg,
                        borderTopColor: isActive
                          ? theme.accent
                          : theme.buttonBorderLight,
                        borderLeftColor: isActive
                          ? theme.accent
                          : theme.buttonBorderLight,
                        borderBottomColor: isActive
                          ? theme.accent
                          : theme.buttonBorderDark,
                        borderRightColor: isActive
                          ? theme.accent
                          : theme.buttonBorderDark,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentedText,
                        {
                          color: isActive
                            ? theme.accentText
                            : theme.textPrimary,
                        },
                      ]}
                    >
                      Formato {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.rowActions}>
              <Pressable
                onPress={() => void handleExport()}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: theme.buttonBg,
                    borderTopColor: theme.buttonBorderLight,
                    borderLeftColor: theme.buttonBorderLight,
                    borderBottomColor: theme.buttonBorderDark,
                    borderRightColor: theme.buttonBorderDark,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: theme.textPrimary },
                  ]}
                >
                  ⬇ Descargar / Exportar {transferFormat.toUpperCase()}
                </Text>
              </Pressable>
            </View>

            {exportPreview !== null && (
              <TextInput
                value={exportPreview}
                editable={false}
                multiline
                selectTextOnFocus
                style={[
                  styles.multilineInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textSecondary,
                  },
                ]}
              />
            )}

            <View
              style={[
                styles.innerDivider,
                { backgroundColor: theme.divider },
              ]}
            />

            <View style={styles.rowBetween}>
              <Text
                style={[styles.fieldLabel, { color: theme.textSecondary }]}
              >
                Cargar citas ({transferFormat.toUpperCase()})
              </Text>
              <View style={styles.inlineToggle}>
                <Pressable
                  onPress={() => setImportMode('append')}
                  style={[
                    styles.miniBtn,
                    {
                      backgroundColor:
                        importMode === 'append'
                          ? theme.accent
                          : theme.buttonBg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color:
                        importMode === 'append'
                          ? theme.accentText
                          : theme.textPrimary,
                    }}
                  >
                    Agregar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setImportMode('replace')}
                  style={[
                    styles.miniBtn,
                    {
                      backgroundColor:
                        importMode === 'replace'
                          ? theme.accent
                          : theme.buttonBg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color:
                        importMode === 'replace'
                          ? theme.accentText
                          : theme.textPrimary,
                    }}
                  >
                    Reemplazar
                  </Text>
                </Pressable>
              </View>
            </View>

            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder={
                transferFormat === 'json'
                  ? '[{"text":"...","author":"...","year":1950,"country":"...","tags":["filosofía"]}]'
                  : 'id,text,author,year,country,tags\nq-100,"Cita de ejemplo","Autor",2024,México,filosofía|arte'
              }
              placeholderTextColor={theme.textMuted}
              style={[
                styles.multilineInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                },
              ]}
            />

            <View style={styles.urlImportRow}>
              <TextInput
                value={importUrl}
                onChangeText={setImportUrl}
                placeholder={`O cargar desde URL (.${transferFormat})...`}
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  styles.flexInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
              <Pressable
                onPress={() => void handleImportFromUrl()}
                disabled={isFetchingFileUrl}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: theme.buttonBg,
                    borderTopColor: theme.buttonBorderLight,
                    borderLeftColor: theme.buttonBorderLight,
                    borderBottomColor: theme.buttonBorderDark,
                    borderRightColor: theme.buttonBorderDark,
                  },
                ]}
              >
                {isFetchingFileUrl ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: theme.textPrimary },
                    ]}
                  >
                    URL
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={styles.rowActions}>
              <Pressable
                onPress={() => handleImportFromText(importText)}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: theme.buttonBg,
                    borderTopColor: theme.buttonBorderLight,
                    borderLeftColor: theme.buttonBorderLight,
                    borderBottomColor: theme.buttonBorderDark,
                    borderRightColor: theme.buttonBorderDark,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: theme.textPrimary },
                  ]}
                >
                  ⬆ Cargar {transferFormat.toUpperCase()}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  resetLocalQuotes();
                  setTransferFeedback({
                    type: 'ok',
                    message: 'Catálogo local restaurado.',
                  });
                }}
                style={styles.linkBtn}
              >
                <Text
                  style={[
                    styles.clearText,
                    { color: theme.textMuted, fontSize: 11 },
                  ]}
                >
                  Restablecer 50 citas iniciales
                </Text>
              </Pressable>
            </View>

            {transferFeedback && (
              <Text
                style={[
                  styles.feedbackText,
                  {
                    color:
                      transferFeedback.type === 'ok'
                        ? theme.accent
                        : theme.danger,
                  },
                ]}
              >
                {transferFeedback.message}
              </Text>
            )}
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
                            ? theme.accentText
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

        {/* Filtros por Autor */}
        {authors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              AUTOR
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
                🔍
              </Text>
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder="Buscar autor..."
                placeholderTextColor={theme.textMuted}
                value={authorQuery}
                onChangeText={setAuthorQuery}
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
    </View>
  );
};

export interface SettingsPanelProps {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  theme,
  onClose,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlayWrapper}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar ajustes tocando el fondo"
        />
        <View
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

          <SettingsContent theme={theme} onClose={onClose} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentRoot: {
    flex: 1,
    minHeight: 380,
  },
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
    height: 480,
    maxHeight: '88%',
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBox: {
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
  flexInput: {
    flex: 1,
  },
  multilineInput: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    minHeight: 68,
    maxHeight: 110,
    textAlignVertical: 'top',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  miniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  urlImportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  linkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '600',
  },
  innerDivider: {
    height: 1,
    marginVertical: 2,
  },
});
