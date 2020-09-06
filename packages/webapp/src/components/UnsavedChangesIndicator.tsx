import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: -0.2em 0;
  color: ${props => props.theme.baseColors.foreground};

  svg {
    font-size: 0.5em;
  }
`;

export interface Props {
  className?: string;
  title?: string;
}

export function UnsavedChangesIndicator(props: Props) {
  return (
    <Container {...props}>
      <FontAwesomeIcon icon={faCircle} />
    </Container>
  );
}

export default UnsavedChangesIndicator;
