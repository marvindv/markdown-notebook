import React, { PropsWithChildren, ReactNode } from 'react';
import Button from 'src/components/Button';
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
`;

const AddElementButton = styled(Button)`
  border-radius: 0;
  border-width: 0;
  border-top-width: ${props => props.theme.buttons.borderWidth};
`;

export default function Column(
  props: PropsWithChildren<{
    addButtonText: ReactNode;
    onAddClick: () => void;
  }>
) {
  return (
    <ColumnContainer>
      <ul>{props.children}</ul>

      <AddElementButton onClick={props.onAddClick} themeColor='secondary'>
        {props.addButtonText}
      </AddElementButton>
    </ColumnContainer>
  );
}
