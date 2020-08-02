// This file contains definition on how the theme is stuctured. This way the
// theme definition is available to every styled components without ex
// See https://styled-components.com/docs/api#typescript

import 'styled-components';

declare module 'styled-components' {
  // Define the theme colors here so it can be used here in `DefaultTheme`.
  // This is reexported as `ThemeColors` from `theme.ts`.
  export type __ThemeColors = 'primary' | 'secondary' | 'default';

  export interface DefaultTheme {
    base: {
      borderRadius: string;
    };

    baseColors: {
      primary: string;
      secondary: string;
      default: string;
      danger: string;
      contentBackground: string;
      foreground: string;
    };

    borders: {
      width: string;
      color: string;
    };

    forms: {
      inputPaddingX: string;
      inputPaddingY: string;
    };

    buttons: {
      paddingX: string;
      paddingY: string;

      borderWidth: string;

      themes: {
        [color in __ThemeColors]: {
          border: string;
          background: string;
          hover: string;
          active: string;
          foreground: string;
        };
      };
    };

    typo: {
      fontSizeSm: string;
      mutedColor: string;
    };
  }
}
