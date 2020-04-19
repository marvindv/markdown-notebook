import { createGlobalStyle } from 'styled-components';

import THEME from './theme';

export const GlobalStyle = createGlobalStyle<{ theme: typeof THEME }>`
  button {
    cursor: pointer;
    border: ${props => props.theme.buttons.borderWidth} solid;
    padding: ${props => props.theme.buttons.paddingY} ${props =>
  props.theme.buttons.paddingX}
  }
`;

export default GlobalStyle;
