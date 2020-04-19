import React from 'react';
import styled from 'styled-components';

import Path from './models/path';
import Notebook from './models/notebook';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const Column = styled.ol`
  flex: 1;
  // https://stackoverflow.com/questions/26465745/ellipsis-in-flexbox-container
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;

  & + & {
    border-left: 1px solid #ddd;
  }

  &:last-of-type {
    border-right: 1px solid #ddd;
  }
`;

const ElementContainer = styled.li`
  & + & {
    border-top: 1px solid #ddd;
  }

  &.active {
    background-color: rgba(0, 120, 0, 0.2);
  }

  &:not(.active):hover {
    background-color: rgba(0, 120, 0, 0.1);
  }
`;

const ElementButton = styled.button`
  width: 100%;
  padding: 1rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background: none;
  border: 0;
`;

/**
 * An element in a column, either notebook, section or page.
 *
 * @param props
 */
const Element = function (props: {
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
};

export interface NavigationProps {
  className?: string;
  path: Path;
  notebooks: Notebook[];
  onPathChange?: (newPath: Path) => void;
}

/**
 * The navigation panel to display and change the current path in the notebook
 * structure.
 *
 * @export
 * @param {NavigationProps} props
 * @returns
 */
export default function Navigation(props: NavigationProps) {
  const path = props.path;

  const handleNotebookClick = (title: string) => {
    // Only emit if actually another notebook selected.
    if (path.notebookTitle !== title) {
      props.onPathChange?.({
        notebookTitle: title,
      });
    }
  };
  const notebooksColumn = (
    <Column>
      {props.notebooks.map(n => (
        <Element
          key={n.title}
          className={n.title === path?.notebookTitle ? 'active' : ''}
          onClick={() => handleNotebookClick(n.title)}
        >
          {n.title}
        </Element>
      ))}
    </Column>
  );

  let sectionsColumn;
  if (path.notebookTitle) {
    const notebook = props.notebooks.find(n => n.title === path.notebookTitle);
    const handleClick = (title: string) => {
      // Only emit if actually another section selected.
      if (path.sectionTitle !== title) {
        props.onPathChange?.({
          notebookTitle: notebook!.title,
          sectionTitle: title,
        });
      }
    };

    sectionsColumn = (
      <Column>
        {notebook?.sections.map(section => (
          <Element
            key={section.title}
            className={section.title === path?.sectionTitle ? 'active' : ''}
            onClick={() => handleClick(section.title)}
          >
            {section.title}
          </Element>
        ))}
      </Column>
    );
  }

  let pagesColumn;
  if (path.sectionTitle) {
    const notebook = props.notebooks.find(n => n.title === path.notebookTitle);
    const section = notebook?.sections.find(s => s.title === path.sectionTitle);
    const handleClick = (title: string) => {
      // Only emit if actually another page selected.
      if (path.pageTitle !== title) {
        props.onPathChange?.({
          ...path,
          pageTitle: title,
        });
      }
    };

    pagesColumn = (
      <Column>
        {section?.pages.map(page => (
          <Element
            key={page.title}
            className={page.title === path?.pageTitle ? 'active' : ''}
            onClick={() => handleClick(page.title)}
          >
            {page.title}
          </Element>
        ))}
      </Column>
    );
  }

  return (
    <Container className={props.className}>
      {notebooksColumn}
      {sectionsColumn}
      {pagesColumn}
    </Container>
  );
}
