import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';

const ElementContainer = styled.li`
  &.active {
    background-color: ${props =>
      transparentize(0.5, props.theme.borders.color)};
  }

  &:hover {
    background-color: ${props =>
      transparentize(0.25, props.theme.borders.color)};
  }
`;

const ElementButton = styled.button`
  width: 100%;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background: none;
  border: 0;
  padding: 1rem;
`;

/**
 * An element in a column, either notebook, section or page.
 *
 * @param props
 */
export default function Element(props: {
  onClick?: () => void;
  className: string;
  children: any;
}) {
  return (
    <ElementContainer className={props.className}>
      <ElementButton type='button' onClick={props.onClick}>
        {props.children}
      </ElementButton>
    </ElementContainer>
  );
}
