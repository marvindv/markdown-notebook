import { DefaultTheme } from 'styled-components';
import { darken } from 'polished';

export type ThemeColors = 'primary' | 'secondary';

export const BASE = {
  borderRadius: '0.25rem',
};

export const BASE_COLORS = {
  primary: '#FA7368',
  secondary: '#37ACAD',
  lightGrey: '#eee',
  danger: 'red',
};

export const BORDERS = {
  width: '1px',
  color: '#cfcfcf',
};

export const FORMS = {
  inputPaddingX: '1rem',
  inputPaddingY: '0.5rem',
};

export const BUTTONS = {
  paddingX: '1rem',
  paddingY: '0.5rem',

  borderWidth: '2px',

  themes: {
    primary: {
      border: darken(0.1, BASE_COLORS.primary),
      background: BASE_COLORS.primary,
      hover: darken(0.1, BASE_COLORS.primary),
      active: darken(0.05, BASE_COLORS.primary),
      foreground: '#fff',
    },

    secondary: {
      border: darken(0.1, BASE_COLORS.secondary),
      background: BASE_COLORS.secondary,
      hover: darken(0.1, BASE_COLORS.secondary),
      active: darken(0.05, BASE_COLORS.secondary),
      foreground: '#fff',
    },
  },
};

export const TYPO = {
  fontSizeSm: '75%',
  mutedColor: '#888',
};

export const THEME: DefaultTheme = {
  base: BASE,
  baseColors: BASE_COLORS,
  borders: BORDERS,
  forms: FORMS,
  buttons: BUTTONS,
  typo: TYPO,
};

export default THEME;
