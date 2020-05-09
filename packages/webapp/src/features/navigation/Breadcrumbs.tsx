import React from 'react';
import UnsavedChangesIndicator from 'src/components/UnsavedChangesIndicator';
import Path from 'src/models/path';
import styled from 'styled-components';

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

const BreadcrumbsUnsavedChangesIndicator = styled(UnsavedChangesIndicator)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
`;

export interface Props {
  path: Path;
  className?: string;
  unsavedChangesIndicator: boolean;
}

export default function Breadcrumbs(props: Props) {
  const { path, className, unsavedChangesIndicator } = props;
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
      {unsavedChangesIndicator && (
        <BreadcrumbsUnsavedChangesIndicator title='Diese Seite enthält ungespeicherte Änderungen' />
      )}
    </Container>
  );
}
