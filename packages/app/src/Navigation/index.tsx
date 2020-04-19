import React from 'react';
import styled from 'styled-components';

import Path, { SectionPath } from '../models/path';
import Notebook from '../models/notebook';
import Column from './Column';
import Element from './Element';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

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
