import { darken } from 'polished';

export const BASE_COLORS = {
  primary: '#FA7368',
  secondary: '#37ACAD',
};

export const BORDERS = {
  width: '1px',
  color: '#e0e0e0',
};

export const BUTTONS = {
  paddingX: '1rem',
  paddingY: '0.5rem',

  borderWidth: '2px',

  primaryBorder: darken(0.1, BASE_COLORS.primary),
  primaryBackground: BASE_COLORS.primary,
  primaryHover: darken(0.1, BASE_COLORS.primary),
  primaryForeground: '#fff',

  secondaryBorder: darken(0.1, BASE_COLORS.secondary),
  secondaryBackground: BASE_COLORS.secondary,
  secondaryHover: darken(0.1, BASE_COLORS.secondary),
  secondaryForeground: '#fff',
};

export const TYPO = {
  fontSizeSm: '75%',
  mutedColor: '#888',
};

export const THEME = {
  baseColors: BASE_COLORS,
  borders: BORDERS,
  buttons: BUTTONS,
  typo: TYPO,
};

export default THEME;
