import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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

interface BeveledWindowProps {
  quote: Quote | null;
  theme: AppTheme;
  hasActiveFilters: boolean;
  onNextQuote: () => void;
  onOpenSettings: () => void;
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
  onNextQuote,
  onOpenSettings,
  onClose,
  onClearFilters,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const targetWidth = Math.min(screenWidth - 32, 380);
  const [windowSize, setWindowSize] = useState({
    width: targetWidth,
    height: 300,
  });
  const hasCenteredRef = useRef(false);

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
        margin: 12,
      }),
    [screenWidth, screenHeight, windowSize.width, windowSize.height]
  );

  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  const pan = useRef(
    new Animated.ValueXY({
      x: Math.max(bounds.minX, (screenWidth - targetWidth) / 2),
      y: Math.max(bounds.minY, (screenHeight - 300) / 2),
    })
  ).current;

  const currentPosRef = useRef({
    x: Math.max(bounds.minX, (screenWidth - targetWidth) / 2),
    y: Math.max(bounds.minY, (screenHeight - 300) / 2),
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
    if (!hasCenteredRef.current) {
      hasCenteredRef.current = true;
      const nextBounds = computeSafeDragBounds({
        screenWidth,
        screenHeight,
        windowWidth: width,
        windowHeight: height,
        insetTop: 0,
        insetBottom: 0,
        insetLeft: 0,
        insetRight: 0,
        margin: 12,
      });
      const centeredX = clampValue(
        (screenWidth - width) / 2,
        nextBounds.minX,
        nextBounds.maxX
      );
      const centeredY = clampValue(
        (screenHeight - height) / 2,
        nextBounds.minY,
        nextBounds.maxY
      );
      currentPosRef.current = { x: centeredX, y: centeredY };
      pan.setValue({ x: centeredX, y: centeredY });
    }
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
            Citas Célebres
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <BevelButton
            onPress={onNextQuote}
            accessibilityLabel="Siguiente cita"
            theme={theme}
            symbol="↻"
          />
          <BevelButton
            onPress={onOpenSettings}
            accessibilityLabel="Abrir ajustes"
            theme={theme}
            symbol="⚙"
          />
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
          {
            backgroundColor: theme.windowInnerBg,
            borderTopColor: theme.innerBevelShadow,
            borderLeftColor: theme.innerBevelShadow,
            borderBottomColor: theme.innerBevelHighlight,
            borderRightColor: theme.innerBevelHighlight,
          },
        ]}
      >
        {quote ? (
          <View style={styles.quoteContent}>
            <Text style={[styles.quoteText, { color: theme.textPrimary }]}>
              “{quote.text}”
            </Text>

            <View
              style={[styles.divider, { backgroundColor: theme.divider }]}
            />

            <View style={styles.metaBlock}>
              <Text style={[styles.authorText, { color: theme.accent }]}>
                — {quote.author}
              </Text>

              {(hasYear || hasCountry) && (
                <View style={styles.historicalRow}>
                  {hasCountry && (
                    <Text
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

            <View style={styles.tagsRow}>
              {quote.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagPill, { backgroundColor: theme.tagBg }]}
                >
                  <Text style={[styles.tagText, { color: theme.tagText }]}>
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
  quoteText: {
    fontFamily: SERIF_FONT,
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 30,
  },
  divider: {
    height: 1,
    width: 48,
  },
  metaBlock: {
    gap: 6,
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
