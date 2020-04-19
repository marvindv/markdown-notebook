import React from 'react';
import styled from 'styled-components';
import { darken, lighten, opacify, transparentize } from 'polished';

import Path, { SectionPath } from './models/path';
import Notebook from './models/notebook';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

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

const Column = (props: {
  addButtonText: string;
  onClick: () => void;
  children: any;
}) => (
  <ColumnContainer>
    <ul>{props.children}</ul>

    <button type='button' className='add-element' onClick={props.onClick}>
      {props.addButtonText}
    </button>
  </ColumnContainer>
);

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
  onNewPage: (path: SectionPath, pageTitle: string) => void;
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
    <Column addButtonText='+ Notizbuch' onClick={() => {}}>
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
      <Column addButtonText='+ Abschnitt' onClick={() => {}}>
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
      <Column
        addButtonText='+ Seite'
        onClick={() =>
          props.onNewPage({ ...path, pageTitle: undefined }, 'Neue Seite')
        }
      >
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
