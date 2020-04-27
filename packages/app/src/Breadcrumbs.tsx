import React from 'react';
import styled from 'styled-components';
import Path from 'models/path';

export interface Props {
  path: Path;
  className?: string;
}

const Container = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  color: ${props => props.theme.typo.mutedColor};
  font-size: ${props => props.theme.typo.fontSizeSm};
`;

const Element = styled.li`
  & + &::before {
    content: '>';
    margin: 0 0.5rem;
  }
`;

export default function Breadcrumbs({ path, className }: Props) {
  const elements = [];
  if (path.notebookTitle) {
    elements.push(path.notebookTitle);

    if (path.sectionTitle) {
      elements.push(path.sectionTitle);

      if (path.pageTitle) {
        elements.push(path.pageTitle);
      }
    }
  }

  return (
    <Container className={className}>
      {elements.map((el, i) => (
        <Element key={i}>{el}</Element>
      ))}
    </Container>
  );
}
