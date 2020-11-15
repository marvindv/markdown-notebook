import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Placement } from '@popperjs/core';
import React, {
  ButtonHTMLAttributes,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useMemo,
  useRef,
  useState,
} from 'react';
import useOutsideClick from 'src/hooks/useOutsideClick';
import styled from 'styled-components';
import { Container as PopoverContainer, Popover } from './Popover';

const Container = styled.div`
  position: relative;

  ${PopoverContainer} {
    padding-left: 0;
    padding-right: 0;
  }
`;

/**
 * The toggle button used to show and hide the dropdown menu.
 * This is not supposed to be used directly and outside of the Dropdown except
 * for adjusting the style of the dropdown.
 */
export const DropdownToggle = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.baseColors.foreground};
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)``;

/**
 * The item inside the dropdown menu.
 * This is not supposed to be used directly and outside of the Dropdown except
 * for adjusting the style of the dropdown.
 */
const Item = styled.button`
  border: 0;
  color: ${({ theme }) => theme.baseColors.foreground};
  background: transparent;
  display: block;
  padding: 0.5rem 1rem;
  width: 100%;
  text-align: left;
  white-space: nowrap;

  .empty-icon {
    display: inline-block;
    // This should equal the width of a fixed-width fontawesome icon.
    width: 1.25rem;
  }

  .empty-icon,
  ${StyledFontAwesomeIcon} {
    margin-right: 0.25rem;
  }

  &[disabled] {
    cursor: default;
    color: ${({ theme }) => theme.typo.mutedColor};
  }

  &:not([disabled]):hover {
    background-color: ${props =>
      props.theme.buttons.themes.secondary.background};
    color: ${props => props.theme.buttons.themes.secondary.foreground};
  }
`;

export interface BaseDropdownItem {
  isSpacer?: boolean;
  textOnly?: boolean;
  icon?: IconDefinition;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface SpacerDropdownItem extends BaseDropdownItem {
  isSpacer: true;
  textOnly?: undefined;
  icon?: undefined;
  label?: undefined;
  disabled?: undefined;
  onClick?: undefined;
}

export interface ButtonDropdownItem extends BaseDropdownItem {
  isSpacer?: undefined;
  textOnly?: undefined;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface TextDropdownItem extends BaseDropdownItem {
  isSpacer?: undefined;
  textOnly: true;
  label: string;
  disabled?: undefined;
  onClick?: undefined;
}

export type DropdownItem =
  | ButtonDropdownItem
  | SpacerDropdownItem
  | TextDropdownItem;

export interface Props {
  className?: string;
  show: boolean;
  /**
   * The value indicating the position of the menu in relation to the dropdown
   * toggle. Defaults to `'bottom'`.
   *
   * @type {Placement}
   * @memberof Props
   */
  menuAlignment?: Placement;
  toggleLabel: string | JSX.Element;
  items: DropdownItem[];
  toggleButton?: ForwardRefExoticComponent<
    PropsWithoutRef<ButtonHTMLAttributes<any>> &
      RefAttributes<HTMLButtonElement>
  >;
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

  const showIcons = useMemo(() => props.items.some(i => i.icon), [props.items]);

  useOutsideClick(ref, props.show, () => {
    props.onToggleClick?.();
  });

  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLButtonElement | null>(null);

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
      <ToggleButton
        type='button'
        onClick={handleToggleClick}
        ref={setReferenceElement}
      >
        {props.toggleLabel}
      </ToggleButton>
      <Popover
        show={props.show}
        referenceElement={referenceElement}
        menuAlignment={props.menuAlignment}
      >
        {props.items.map((item, i) => (
          <Item
            key={i}
            onClick={ev => handleClick(ev, item.onClick)}
            disabled={item.disabled || item.isSpacer || item.textOnly}
          >
            {showIcons &&
              (item.icon ? (
                <StyledFontAwesomeIcon fixedWidth={true} icon={item.icon} />
              ) : (
                <span className='empty-icon' />
              ))}
            {item.label}
          </Item>
        ))}
      </Popover>
    </Container>
  );
}

export default Dropdown;
