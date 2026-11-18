import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../theme/themes';

interface RestoreWindowButtonProps {
  theme: AppTheme;
  onRestore: () => void;
}

export const RestoreWindowButton: React.FC<RestoreWindowButtonProps> = ({
  theme,
  onRestore,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Text style={[styles.hintText, { color: theme.textMuted }]}>
        La ventana está oculta. Toca el botón o la pantalla para mostrarla.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mostrar ventana de citas"
        onPress={onRestore}
        style={({ pressed }) => [
          styles.buttonOuter,
          {
            backgroundColor: theme.windowBg,
            borderTopColor: pressed ? theme.bevelShadow : theme.bevelHighlight,
            borderLeftColor: pressed ? theme.bevelShadow : theme.bevelHighlight,
            borderBottomColor: pressed
              ? theme.bevelHighlight
              : theme.bevelShadow,
            borderRightColor: pressed
              ? theme.bevelHighlight
              : theme.bevelShadow,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <Text style={[styles.buttonIcon, { color: theme.accent }]}>❐</Text>
        <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
          Mostrar Citas
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
  },
  buttonOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
