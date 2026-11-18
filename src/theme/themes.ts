import { ThemeMode } from '../types/quote';

export interface AppTheme {
  mode: ThemeMode;
  backdrop: string;
  backdropPattern: string;
  windowBg: string;
  windowInnerBg: string;
  titleBarBg: string;
  // Outer bevel (classic 3D frame: light top/left, dark bottom/right)
  bevelHighlight: string;
  bevelShadow: string;
  // Inner recessed bevel
  innerBevelHighlight: string;
  innerBevelShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  buttonBg: string;
  buttonBorderLight: string;
  buttonBorderDark: string;
  tagBg: string;
  tagText: string;
  divider: string;
  shadowColor: string;
  modalBg: string;
  inputBg: string;
  inputBorder: string;
  danger: string;
}

export const themes: Record<ThemeMode, AppTheme> = {
  light: {
    mode: 'light',
    backdrop: '#D8D4CC',
    backdropPattern: '#C8C3B8',
    windowBg: '#EAE6DF',
    windowInnerBg: '#F6F3EC',
    titleBarBg: '#DFDBD2',
    bevelHighlight: '#FFFFFF',
    bevelShadow: '#8B8579',
    innerBevelHighlight: '#FFFFFF',
    innerBevelShadow: '#B5AFA4',
    textPrimary: '#1E1D1B',
    textSecondary: '#4A4742',
    textMuted: '#78736A',
    accent: '#2D5A7B',
    accentText: '#FFFFFF',
    buttonBg: '#E3DFD6',
    buttonBorderLight: '#FFFFFF',
    buttonBorderDark: '#9A9488',
    tagBg: '#E2DDD3',
    tagText: '#3F3C37',
    divider: '#D0CAC0',
    shadowColor: '#2B2720',
    modalBg: '#F2EFE9',
    inputBg: '#FFFFFF',
    inputBorder: '#B8B2A6',
    danger: '#A63A3A',
  },
  dark: {
    mode: 'dark',
    backdrop: '#121316',
    backdropPattern: '#1A1C21',
    windowBg: '#23262E',
    windowInnerBg: '#1B1E24',
    titleBarBg: '#2A2E38',
    // Inverted bevel for dark mode: subtle cool-slate highlight vs deep shadow
    bevelHighlight: '#101216',
    bevelShadow: '#434957',
    innerBevelHighlight: '#121419',
    innerBevelShadow: '#353A46',
    textPrimary: '#F0EDE6',
    textSecondary: '#C4C0B8',
    textMuted: '#8B8E98',
    accent: '#6BA4CE',
    accentText: '#111317',
    buttonBg: '#2E323D',
    buttonBorderLight: '#14161B',
    buttonBorderDark: '#474D5C',
    tagBg: '#2B2F3A',
    tagText: '#D2CFC7',
    divider: '#343946',
    shadowColor: '#000000',
    modalBg: '#22252D',
    inputBg: '#17191F',
    inputBorder: '#3E4452',
    danger: '#D46A6A',
  },
};
