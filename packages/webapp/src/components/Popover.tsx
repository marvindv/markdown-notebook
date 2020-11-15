import { Placement } from '@popperjs/core';
import React, { PropsWithChildren, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';

/**
 * The container that contains the actual popover.
 * This is not supposed to be used directly outside of the Popover except for
 * adjusting the style of the popover.
 */
export const Container = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.baseColors.contentBackground};
  // Slightly adjusted material depth 3 shadow.
  // From https://codepen.io/sdthornton/pen/wBZdXq
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.19), 0 0px 6px rgba(0, 0, 0, 0.23);
  border-radius: 0.25rem;
  border: ${props => props.theme.borders.width} solid
    ${props => props.theme.borders.color};
  z-index: 100;
`;

export interface Props {
  show: boolean;
  /**
   * The element the popover is placed next to.
   */
  referenceElement: Element | null;
  /**
   * The value indicating the position of the popover in relation to the
   * reference element.
   */
  menuAlignment?: Placement;
}

/**
 * An element that contains arbitrary content that can be displayed next to
 * an reference element.
 *
 * @export
 * @param {PropsWithChildren<Props>} props
 * @returns
 */
export function Popover(props: PropsWithChildren<Props>) {
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    props.referenceElement,
    popperElement,
    {
      placement: props.menuAlignment || 'bottom',
    }
  );

  return (
    <>
      {props.show && (
        <Container
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {props.children}
        </Container>
      )}
    </>
  );
}
