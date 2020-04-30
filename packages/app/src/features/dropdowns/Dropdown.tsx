import useOutsideClick from 'hooks/useOutsideClick';
import React, { useRef } from 'react';
import styled from 'styled-components';

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
export const Menu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  padding: 0.5rem 0;
  background-color: white;
  // Slightly adjusted material depth 3 shadow.
  // From https://codepen.io/sdthornton/pen/wBZdXq
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.19), 0 0px 6px rgba(0, 0, 0, 0.23);
  border-radius: 0.25rem;
  border: ${props => props.theme.borders.width} solid
    ${props => props.theme.borders.color};
  z-index: 100;
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
    background-color: ${props => props.theme.buttons.secondaryBackground};
    color: ${props => props.theme.buttons.secondaryForeground};
  }
`;

export interface DropdownItem {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface Props {
  className?: string;
  show: boolean;
  toggleLabel: string | JSX.Element;
  items: DropdownItem[];
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
export default function Dropdown(props: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, props.show, () => {
    props.onToggleClick?.();
  });

  return (
    <Container className={props.className} ref={ref}>
      <DropdownToggle type='button' onClick={() => props.onToggleClick?.()}>
        {props.toggleLabel}
      </DropdownToggle>
      {props.show && (
        <Menu>
          {props.items.map((item, i) => (
            <Item key={i} onClick={item.onClick} disabled={item.disabled}>
              {item.label}
            </Item>
          ))}
        </Menu>
      )}
    </Container>
  );
}
