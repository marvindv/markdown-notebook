import { createGlobalStyle } from 'styled-components';

import THEME from './theme';

export const GlobalStyle = createGlobalStyle<{ theme: typeof THEME }>`
  *, :after, :before {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
    border: ${props => props.theme.buttons.borderWidth} solid;
    padding: ${props => props.theme.buttons.paddingY} ${props =>
  props.theme.buttons.paddingX}
  }

  a:not(:hover) {
    text-decoration: none;
  }
`;

export default GlobalStyle;
