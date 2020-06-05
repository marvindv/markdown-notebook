import React, { ButtonHTMLAttributes, useRef } from 'react';
import useOutsideClick from 'src/hooks/useOutsideClick';
import styled, { css } from 'styled-components';

const Container = styled.div`
  position: relative;
`;

/**
 * The toggle button used to show and hide the dropdown menu.
 * This is not supposed to be used directly and outside of the Dropdown except
 * for adjusting the style of the dropdown.
 */
export const DropdownToggle = styled.button`
  border: 0;
  background: transparent;
`;

/**
 * The menu containing the dropdown items.
 * This is not supposed to be used directly and outside of the Dropdown except
 * for adjusting the style of the dropdown.
 */
export const Menu = styled.div<{ align: 'left' | 'right' }>`
  position: absolute;
  top: 100%;
  padding: 0.5rem 0;
  background-color: white;
  // Slightly adjusted material depth 3 shadow.
  // From https://codepen.io/sdthornton/pen/wBZdXq
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.19), 0 0px 6px rgba(0, 0, 0, 0.23);
  border-radius: 0.25rem;
  border: ${props => props.theme.borders.width} solid
    ${props => props.theme.borders.color};
  z-index: 100;

  ${props =>
    props.align === 'left'
      ? css`
          left: 0;
        `
      : css`
          right: 0;
        `}
`;

/**
 * The item inside the dropdown menu.
 * This is not supposed to be used directly and outside of the Dropdown except
 * for adjusting the style of the dropdown.
 */
const Item = styled.button`
  border: 0;
  background: transparent;
  display: block;
  padding: 0.5rem 1rem;
  width: 100%;
  text-align: left;
  white-space: nowrap;

  &[disabled] {
    cursor: default;
  }

  &:not([disabled]):hover {
    background-color: ${props =>
      props.theme.buttons.themes.secondary.background};
    color: ${props => props.theme.buttons.themes.secondary.foreground};
  }
`;

export interface BaseDropdownItem {
  isSpacer?: boolean | undefined;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface SpacerDropdownItem extends BaseDropdownItem {
  isSpacer: true;
  label?: undefined;
  disabled?: undefined;
  onClick?: undefined;
}

export interface ButtonDropdownItem extends BaseDropdownItem {
  isSpacer?: undefined;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export type DropdownItem = ButtonDropdownItem | SpacerDropdownItem;

export interface Props {
  className?: string;
  show: boolean;
  /**
   * The value indicating whether the dropdown menu aligns on the left of the
   * dropdown toggle or on the right of it. Defaults to `'right'`.
   *
   * @type {('left' | 'right')}
   * @memberof Props
   */
  menuAlignment?: 'left' | 'right';
  toggleLabel: string | JSX.Element;
  items: DropdownItem[];
  toggleButton?: React.ComponentType<ButtonHTMLAttributes<any>>;
  onToggleClick?: () => void;
}

/**
 * An element that renders a toggle button and depending on the `show` prop a
 * absolute positioned menu beneath the toggle button. The menu contains a
 * number of items as specified in the `items` prop.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export function Dropdown(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ToggleButton = props.toggleButton || DropdownToggle;

  useOutsideClick(ref, props.show, () => {
    props.onToggleClick?.();
  });

  const handleClick = (
    ev: React.MouseEvent,
    callback: (() => void) | undefined
  ) => {
    props.onToggleClick?.();
    callback?.();
    ev.stopPropagation();
  };

  const handleToggleClick = (ev: React.MouseEvent) => {
    props.onToggleClick?.();
    ev.stopPropagation();
  };

  return (
    <Container className={props.className} ref={ref}>
      <ToggleButton type='button' onClick={handleToggleClick}>
        {props.toggleLabel}
      </ToggleButton>
      {props.show && (
        <Menu align={props.menuAlignment || 'right'}>
          {props.items.map((item, i) => (
            <Item
              key={i}
              onClick={ev => handleClick(ev, item.onClick)}
              disabled={item.disabled || item.isSpacer}
            >
              {item.label}
            </Item>
          ))}
        </Menu>
      )}
    </Container>
  );
}

export default Dropdown;
