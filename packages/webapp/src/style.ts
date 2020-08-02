import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, :after, :before {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body {
    background-color: ${({ theme }) => theme.baseColors.contentBackground};
    color: ${({ theme }) => theme.baseColors.foreground};
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
