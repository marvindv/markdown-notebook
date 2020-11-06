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
  overflow-x: hidden;
  text-overflow: ellipsis;

  // Make some room for the fonts g's and j's that get cut off by the hidden
  // overflow.
  padding: 0.25rem 0;
  margin: -0.25rem 0;

  &:not(:first-of-type)::before {
    content: '>';
    margin: 0 0.5rem;
  }

  button {
    color: ${props => props.theme.typo.mutedColor};
    outline: none;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;

    &:hover {
      color: ${props => props.theme.baseColors.foreground};
      text-decoration: underline;
    }
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
  onCrumbClick: (path: Path) => void;
}

export default function Breadcrumbs(props: Props) {
  const {
    className,
    path,
    unsavedChangesIndicator,
    showOnlyLast,
    onCrumbClick,
  } = props;
  const elements = showOnlyLast ? path.slice(-1) : path;
  const handleClick = (index: number) => {
    onCrumbClick(elements.slice(0, index + 1));
  };

  return (
    <Container className={className}>
      {elements.map((el, i) => (
        <Breadcrumb key={i}>
          <button type='button' onClick={ev => handleClick(i)}>
            {el}
          </button>
        </Breadcrumb>
      ))}
      {unsavedChangesIndicator && (
        <BreadcrumbsUnsavedChangesIndicator title='This file contains unsaved changes' />
      )}
    </Container>
  );
}
