// This file contains definition on how the theme is stuctured. This way the
// theme definition is available to every styled components without ex
// See https://styled-components.com/docs/api#typescript

import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    base: {
      borderRadius: string;
    };

    baseColors: {
      primary: string;
      secondary: string;
      lightGrey: string;
      danger: string;
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
        [color in ThemeColors]: {
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
