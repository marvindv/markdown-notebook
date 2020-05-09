import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const ColumnContainer = styled.div`
  flex: 1;
  // https://stackoverflow.com/questions/26465745/ellipsis-in-flexbox-container
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    overflow-y: auto;
  }

  & + & {
    border-left: ${props => props.theme.borders.width} solid
      ${props => props.theme.borders.color};
  }

  button.add-element {
    width: 100%;
    background-color: ${props =>
      props.theme.buttons.themes.secondary.background};
    color: ${props => props.theme.buttons.themes.secondary.foreground};
    border: 0;
    border-top: ${props => props.theme.buttons.borderWidth} solid
      ${props => props.theme.buttons.themes.secondary.border};

    &:hover {
      background-color: ${props => props.theme.buttons.themes.secondary.hover};
    }
  }
`;

export default function Column(
  props: PropsWithChildren<{
    addButtonText: string;
    onAddClick: () => void;
  }>
) {
  return (
    <ColumnContainer>
      <ul>{props.children}</ul>

      <button type='button' className='add-element' onClick={props.onAddClick}>
        {props.addButtonText}
      </button>
    </ColumnContainer>
  );
}
