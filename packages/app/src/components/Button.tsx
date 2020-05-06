import styled, { css } from 'styled-components';
import { ThemeColors } from 'theme';

export interface Props {
  themeColor?: ThemeColors;
}

const Button = styled.button<Props>`
  user-select: none;
  cursor: pointer;
  border: ${props => props.theme.buttons.borderWidth} solid;
  border-radius: ${props => props.theme.base.borderRadius};
  padding: ${props => props.theme.buttons.paddingY}
    ${props => props.theme.buttons.paddingX};

  ${props =>
    props.themeColor &&
    css`
      border-color: ${props.theme.buttons.themes[props.themeColor].border};
      color: ${props.theme.buttons.themes[props.themeColor].foreground};
      background-color: ${props.theme.buttons.themes[props.themeColor]
        .background};

      &:not([disabled]):hover,
      &:not([disabled]).active:hover {
        background-color: ${props.theme.buttons.themes[props.themeColor].hover};
      }

      &.active {
        background-color: ${props.theme.buttons.themes[props.themeColor]
          .active};
      }

      &[disabled] {
        cursor: default;
      }
    `}
`;

export default Button;
