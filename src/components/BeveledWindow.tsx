import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Clipboard,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppTheme } from '../theme/themes';
import { Quote } from '../types/quote';
import { clampValue, computeSafeDragBounds } from '../utils/quoteFilter';
import { QuoteApiSource } from '../types/quote';
import { SettingsContent } from './SettingsPanel';

interface BeveledWindowProps {
  quote: Quote | null;
  theme: AppTheme;
  hasActiveFilters: boolean;
  apiSource?: QuoteApiSource;
  isLoadingQuote?: boolean;
  isSettingsOpen?: boolean;
  onNextQuote: () => void;
  onOpenSettings: () => void;
  onCloseSettings?: () => void;
  onClose: () => void;
  onClearFilters: () => void;
}

const SERIF_FONT = Platform.select({
  macos: 'Georgia',
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

const BevelButton: React.FC<{
  onPress: () => void;
  accessibilityLabel: string;
  theme: AppTheme;
  symbol: string;
  symbolColor?: string;
}> = ({ onPress, accessibilityLabel, theme, symbol, symbolColor }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={4}
    style={({ pressed }) => [
      styles.controlButton,
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
    <Text
      style={[
        styles.controlButtonText,
        { color: symbolColor ?? theme.textPrimary },
      ]}
    >
      {symbol}
    </Text>
  </Pressable>
);

export const BeveledWindow: React.FC<BeveledWindowProps> = ({
  quote,
  theme,
  hasActiveFilters,
  apiSource,
  isLoadingQuote,
  isSettingsOpen = false,
  onNextQuote,
  onOpenSettings,
  onCloseSettings,
  onClose,
  onClearFilters,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const targetWidth = Math.min(screenWidth - 32, 380);
  const [windowSize, setWindowSize] = useState({
    width: targetWidth,
    height: 300,
  });
  const hasPositionedRef = useRef(false);

  const bounds = useMemo(
    () =>
      computeSafeDragBounds({
        screenWidth,
        screenHeight,
        windowWidth: windowSize.width,
        windowHeight: windowSize.height,
        insetTop: 0,
        insetBottom: 0,
        insetLeft: 0,
        insetRight: 0,
        margin: 8,
      }),
    [screenWidth, screenHeight, windowSize.width, windowSize.height]
  );

  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  const pan = useRef(
    new Animated.ValueXY({
      x: bounds.minX,
      y: bounds.minY,
    })
  ).current;

  const currentPosRef = useRef({
    x: bounds.minX,
    y: bounds.minY,
  });
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const clampedX = clampValue(
      currentPosRef.current.x,
      bounds.minX,
      bounds.maxX
    );
    const clampedY = clampValue(
      currentPosRef.current.y,
      bounds.minY,
      bounds.maxY
    );
    if (
      clampedX !== currentPosRef.current.x ||
      clampedY !== currentPosRef.current.y
    ) {
      currentPosRef.current = { x: clampedX, y: clampedY };
      pan.setValue({ x: clampedX, y: clampedY });
    }
  }, [bounds.minX, bounds.maxX, bounds.minY, bounds.maxY, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
      onPanResponderGrant: () => {
        dragStartRef.current = { ...currentPosRef.current };
      },
      onPanResponderMove: (_, gestureState) => {
        const b = boundsRef.current;
        const nextX = clampValue(
          dragStartRef.current.x + gestureState.dx,
          b.minX,
          b.maxX
        );
        const nextY = clampValue(
          dragStartRef.current.y + gestureState.dy,
          b.minY,
          b.maxY
        );
        currentPosRef.current = { x: nextX, y: nextY };
        pan.setValue({ x: nextX, y: nextY });
      },
      onPanResponderRelease: (_, gestureState) => {
        const b = boundsRef.current;
        const targetX = clampValue(
          currentPosRef.current.x + gestureState.vx * 24,
          b.minX,
          b.maxX
        );
        const targetY = clampValue(
          currentPosRef.current.y + gestureState.vy * 24,
          b.minY,
          b.maxY
        );
        currentPosRef.current = { x: targetX, y: targetY };
        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 7,
          tension: 70,
        }).start();
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== windowSize.width || height !== windowSize.height) {
      setWindowSize({ width, height });
    }
    if (!hasPositionedRef.current) {
      hasPositionedRef.current = true;
      const nextBounds = computeSafeDragBounds({
        screenWidth,
        screenHeight,
        windowWidth: width,
        windowHeight: height,
        insetTop: 0,
        insetBottom: 0,
        insetLeft: 0,
        insetRight: 0,
        margin: 8,
      });
      const initialX = nextBounds.minX;
      const initialY = nextBounds.minY;
      currentPosRef.current = { x: initialX, y: initialY };
      pan.setValue({ x: initialX, y: initialY });
    }
  };

  const [copiedState, setCopiedState] = useState<'quote' | 'meta' | 'all' | null>(null);

  const handleCopyQuote = () => {
    if (!quote) return;
    Clipboard.setString(quote.text);
    setCopiedState('quote');
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleCopyMeta = () => {
    if (!quote) return;
    const parts = [
      `— ${quote.author}`,
      hasCountry || hasYear
        ? `(${[quote.country, quote.year].filter(Boolean).join(', ')})`
        : '',
      quote.tags.length > 0 ? quote.tags.map((t) => `#${t}`).join(' ') : '',
    ]
      .filter(Boolean)
      .join(' ');
    Clipboard.setString(parts);
    setCopiedState('meta');
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleCopyAll = () => {
    if (!quote) return;
    const metaParts = [
      `— ${quote.author}`,
      hasCountry || hasYear
        ? `(${[quote.country, quote.year].filter(Boolean).join(', ')})`
        : '',
      quote.tags.length > 0 ? quote.tags.map((t) => `#${t}`).join(' ') : '',
    ]
      .filter(Boolean)
      .join(' ');
    const fullText = `“${quote.text}”\n\n${metaParts}`;
    Clipboard.setString(fullText);
    setCopiedState('all');
    setTimeout(() => setCopiedState(null), 2000);
  };

  const hasYear =
    quote !== null &&
    quote.year !== undefined &&
    String(quote.year).trim() !== '';
  const hasCountry =
    quote !== null &&
    quote.country !== undefined &&
    quote.country.trim() !== '';

  return (
    <Animated.View
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      style={[
        styles.outerFrame,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          width: targetWidth,
          backgroundColor: theme.windowBg,
          borderTopColor: theme.bevelHighlight,
          borderLeftColor: theme.bevelHighlight,
          borderBottomColor: theme.bevelShadow,
          borderRightColor: theme.bevelShadow,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      {/* Title Bar & Integrated Controls */}
      <View
        style={[
          styles.titleBar,
          {
            backgroundColor: theme.titleBarBg,
            borderBottomColor: theme.divider,
          },
        ]}
      >
        <View style={styles.dragHandleArea}>
          <Text style={[styles.dragGrip, { color: theme.textMuted }]}>⋮⋮</Text>
          <Text style={[styles.titleBarText, { color: theme.textSecondary }]}>
            {isSettingsOpen ? '⚙ Ajustes y Fuente' : 'Citas Célebres'}
          </Text>
          {!isSettingsOpen && apiSource && apiSource !== 'local' && (
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                color: theme.accent,
                backgroundColor: theme.accent + '22',
                paddingHorizontal: 4,
                paddingVertical: 1,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {apiSource === 'github-cdn' ? 'CDN' : 'API'}
            </Text>
          )}
        </View>

        <View style={styles.controlsRow}>
          {isSettingsOpen ? (
            <BevelButton
              onPress={onCloseSettings ?? onOpenSettings}
              accessibilityLabel="Volver a las citas"
              theme={theme}
              symbol="← Volver"
            />
          ) : (
            <>
              {quote && (
                <BevelButton
                  onPress={handleCopyAll}
                  accessibilityLabel="Copiar cita completa al portapapeles"
                  theme={theme}
                  symbol={copiedState === 'all' ? '✓' : '📋'}
                  symbolColor={copiedState === 'all' ? theme.accent : undefined}
                />
              )}
              <BevelButton
                onPress={onNextQuote}
                accessibilityLabel="Siguiente cita"
                theme={theme}
                symbol={isLoadingQuote ? '⏳' : '↻'}
              />
              <BevelButton
                onPress={onOpenSettings}
                accessibilityLabel="Abrir ajustes"
                theme={theme}
                symbol="⚙"
              />
            </>
          )}
          <BevelButton
            onPress={onClose}
            accessibilityLabel="Cerrar ventana"
            theme={theme}
            symbol="✕"
            symbolColor={theme.danger}
          />
        </View>
      </View>

      {/* Inner Recessed Bevel Content */}
      <View
        style={[
          styles.innerFrame,
          isSettingsOpen && { height: 430, padding: 0 },
          {
            backgroundColor: theme.windowInnerBg,
            borderTopColor: theme.innerBevelShadow,
            borderLeftColor: theme.innerBevelShadow,
            borderBottomColor: theme.innerBevelHighlight,
            borderRightColor: theme.innerBevelHighlight,
          },
        ]}
      >
        {isSettingsOpen ? (
          <SettingsContent theme={theme} onClose={onCloseSettings} />
        ) : quote ? (
          <View style={styles.quoteContent}>
            <View style={styles.quoteRow}>
              <Text
                selectable={true}
                style={[styles.quoteText, { color: theme.textPrimary }]}
              >
                “{quote.text}”
              </Text>
              <Pressable
                onPress={handleCopyQuote}
                accessibilityRole="button"
                accessibilityLabel="Copiar texto de la cita"
                style={[
                  styles.miniCopyBtn,
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
                    styles.miniCopyBtnText,
                    {
                      color:
                        copiedState === 'quote' ? theme.accent : theme.textMuted,
                    },
                  ]}
                >
                  {copiedState === 'quote' ? '✓' : '⧉'}
                </Text>
              </Pressable>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.divider }]}
            />

            <View style={styles.metaRow}>
              <View style={styles.metaBlock}>
                <Text
                  selectable={true}
                  style={[styles.authorText, { color: theme.accent }]}
                >
                  — {quote.author}
                </Text>

                {(hasYear || hasCountry) && (
                  <View style={styles.historicalRow}>
                    {hasCountry && (
                      <Text
                        selectable={true}
                        style={[
                          styles.historicalText,
                          { color: theme.textMuted },
                        ]}
                      >
                        ⌖ {quote.country}
                      </Text>
                    )}
                    {hasYear && (
                      <Text
                        selectable={true}
                        style={[
                          styles.historicalText,
                          { color: theme.textMuted },
                        ]}
                      >
                        ◷ {String(quote.year)}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleCopyMeta}
                accessibilityRole="button"
                accessibilityLabel="Copiar autor y detalles"
                style={[
                  styles.miniCopyBtn,
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
                    styles.miniCopyBtnText,
                    {
                      color:
                        copiedState === 'meta' ? theme.accent : theme.textMuted,
                    },
                  ]}
                >
                  {copiedState === 'meta' ? '✓' : '⧉'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.tagsRow}>
              {quote.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagPill, { backgroundColor: theme.tagBg }]}
                >
                  <Text
                    selectable={true}
                    style={[styles.tagText, { color: theme.tagText }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.textMuted }]}>
              ⊘
            </Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Sin resultados
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              No hay citas que coincidan con los filtros seleccionados.
            </Text>
            {hasActiveFilters && (
              <Pressable
                onPress={onClearFilters}
                style={[
                  styles.resetBtn,
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
                  style={[styles.resetBtnText, { color: theme.textPrimary }]}
                >
                  Restablecer filtros
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2.5,
    borderRadius: 4,
    padding: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  dragHandleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dragGrip: {
    fontSize: 13,
    letterSpacing: 1,
  },
  titleBarText: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 2,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  innerFrame: {
    borderWidth: 1.5,
    borderRadius: 2,
    padding: 18,
  },
  quoteContent: {
    gap: 14,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  quoteText: {
    flex: 1,
    fontFamily: SERIF_FONT,
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 30,
  },
  divider: {
    height: 1,
    width: 48,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaBlock: {
    flex: 1,
    gap: 6,
  },
  miniCopyBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
    height: 26,
    marginTop: 2,
  },
  miniCopyBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authorText: {
    fontFamily: SERIF_FONT,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  historicalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
  },
  historicalText: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  tagText: {
    fontWeight: '500',
    fontSize: 11,
    textTransform: 'lowercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  resetBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  resetBtnText: {
    fontWeight: '600',
    fontSize: 12,
  },
});
