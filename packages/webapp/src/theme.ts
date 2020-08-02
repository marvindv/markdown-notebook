import { darken } from 'polished';
import { DefaultTheme, __ThemeColors } from 'styled-components';

export type ThemeColors = __ThemeColors;

interface Colors {
  primary: string;
  secondary: string;
  default: string;
  danger: string;
  border: string;
  muted: string;
  contentBackground: string;
  foreground: string;
}

/**
 * Creates a theme object based on the given colors.
 *
 * @param {Colors} colors
 * @returns {DefaultTheme}
 */
function createTheme(colors: Colors): DefaultTheme {
  return {
    base: {
      borderRadius: '0.25rem',
    },
    baseColors: {
      ...colors,
    },
    borders: {
      width: '1px',
      color: colors.border,
    },
    forms: {
      inputPaddingX: '1rem',
      inputPaddingY: '0.5rem',
    },
    buttons: {
      paddingX: '1rem',
      paddingY: '0.5rem',

      borderWidth: '2px',

      themes: {
        primary: {
          border: darken(0.1, colors.primary),
          background: colors.primary,
          hover: darken(0.1, colors.primary),
          active: darken(0.05, colors.primary),
          foreground: colors.contentBackground,
        },

        secondary: {
          border: darken(0.1, colors.secondary),
          background: colors.secondary,
          hover: darken(0.1, colors.secondary),
          active: darken(0.05, colors.secondary),
          foreground: colors.contentBackground,
        },

        default: {
          border: darken(0.1, colors.default),
          background: colors.default,
          hover: darken(0.1, colors.default),
          active: darken(0.05, colors.default),
          foreground: colors.foreground,
        },
      },
    },
    typo: {
      fontSizeSm: '75%',
      mutedColor: colors.muted,
    },
  };
}

export const lightTheme = createTheme({
  primary: '#FA7368',
  secondary: '#37ACAD',
  default: '#eee',
  danger: 'red',
  border: '#cfcfcf',
  muted: '#888',
  contentBackground: '#fff',
  foreground: '#222',
});

export const darkTheme = createTheme({
  primary: '#FA7368',
  secondary: '#37ACAD',
  default: '#6E6E6E',
  danger: 'red',
  border: '#3B3B3B',
  muted: '#8A8A8A',
  contentBackground: '#2E3133',
  foreground: '#f4f4f4',
});
