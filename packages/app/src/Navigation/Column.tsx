import React from 'react';
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

  &:last-of-type {
    border-right: ${props => props.theme.borders.width} solid
      ${props => props.theme.borders.color};
  }

  button.add-element {
    width: 100%;
    background-color: ${props => props.theme.buttons.secondaryBackground};
    color: ${props => props.theme.buttons.secondaryForeground};
    border: 0;
    border-top: ${props => props.theme.buttons.borderWidth} solid
      ${props => props.theme.buttons.secondaryBorder};

    &:hover {
      background-color: ${props => props.theme.buttons.secondaryHover};
    }
  }
`;

export default function Column(props: {
  addButtonText: string;
  onClick: () => void;
  children: any;
}) {
  return (
    <ColumnContainer>
      <ul>{props.children}</ul>

      <button type='button' className='add-element' onClick={props.onClick}>
        {props.addButtonText}
      </button>
    </ColumnContainer>
  );
}
