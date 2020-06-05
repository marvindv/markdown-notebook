import React from 'react';
import UnsavedChangesIndicator from 'src/components/UnsavedChangesIndicator';
import { Path } from 'src/models/node';
import styled from 'styled-components';

const Container = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  color: ${props => props.theme.typo.mutedColor};
  font-size: ${props => props.theme.typo.fontSizeSm};
`;

export const Breadcrumb = styled.li`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:not(:first-of-type)::before {
    content: '>';
    margin: 0 0.5rem;
  }
`;

const BreadcrumbsUnsavedChangesIndicator = styled(UnsavedChangesIndicator)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
`;

export interface Props {
  className?: string;
  path: Path;
  unsavedChangesIndicator: boolean;
  showOnlyLast: boolean;
}

export default function Breadcrumbs(props: Props) {
  const { className, path, unsavedChangesIndicator, showOnlyLast } = props;
  const elements = showOnlyLast ? path.slice(-1) : path;

  return (
    <Container className={className}>
      {elements.map((el, i) => (
        <Breadcrumb key={i}>{el}</Breadcrumb>
      ))}
      {unsavedChangesIndicator && (
        <BreadcrumbsUnsavedChangesIndicator title='Diese Datei enthält ungespeicherte Änderungen' />
      )}
    </Container>
  );
}
