import { transparentize } from 'polished';
import { ThemeColors } from 'src/theme';
import styled, { css } from 'styled-components';

export interface Props {
  themeColor?: ThemeColors;
  clear?: boolean;
  active?: boolean;
}

export const Button = styled.button<Props>`
  user-select: none;
  cursor: pointer;
  border: ${props => props.theme.buttons.borderWidth} solid;
  border-radius: ${props => props.theme.base.borderRadius};
  padding: ${props => props.theme.buttons.paddingY}
    ${props => props.theme.buttons.paddingX};

  &[disabled] {
    cursor: default;
  }

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

      &.active,
      &:focus {
        background-color: ${props.theme.buttons.themes[props.themeColor]
          .active};
      }

      ${props.active &&
      css`
        &:not([disabled]):hover {
          background-color: ${props.theme.buttons.themes[props.themeColor]
            .hover};
        }

        background-color: ${props.theme.buttons.themes[props.themeColor]
          .active};
      `}
    `}

  ${props =>
    props.clear &&
    props.themeColor &&
    css`
      border-color: transparent;
      background: transparent;
      color: ${props.theme.buttons.themes[props.themeColor].background};

      &:not([disabled]):hover,
      &:not([disabled]).active:hover {
        border-color: ${props.theme.buttons.themes[props.themeColor].border};
        background: transparent;
      }

      &:disabled {
        color: ${transparentize(
          0.5,
          props.theme.buttons.themes[props.themeColor].background
        )};
      }
    `}
`;

export default Button;
