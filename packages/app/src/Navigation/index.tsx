import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faCog,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import Path, { SectionPath } from '../models/path';
import Notebook from '../models/notebook';
import Column from './Column';
import Element from './Element';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: ${props => props.theme.borders.width} solid
    ${props => props.theme.borders.color};

  button {
    border: 0;
    background: transparent;
    color: ${props => props.theme.buttons.secondaryBackground};
  }
`;

const Columns = styled.div`
  display: flex;
  height: 100%;
`;

/**
 * Contains a Header and a number of columns wrapped in the Column element.
 */
const SelectorPane = styled.div`
  flex-direction: column;
  width: 100%;
`;

/**
 * The selector pane for columns that can be collapsed.
 */
const CollapsedSelectorPane = styled(SelectorPane)`
  ${Header} {
    color: ${props => props.theme.typo.mutedColor};
  }
`;

/**
 * The selector pane for columns that are always visible.
 */
const PermanentSelectorPane = styled(SelectorPane)``;

const Container = styled.div<{ showHiddenColumns: boolean }>`
  display: flex;
  height: 100%;

  ${CollapsedSelectorPane} {
    display: ${props => (props.showHiddenColumns ? 'flex' : 'none')};
  }

  ${PermanentSelectorPane} {
    display: ${props => (props.showHiddenColumns ? 'none' : 'flex')};
  }
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
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);

  const path = props.path;

  const handleNotebookClick = (title: string) => {
    // Only emit if actually another notebook selected.
    if (path.notebookTitle !== title) {
      props.onPathChange?.({
        notebookTitle: title,
      });
      setShowHiddenColumns(false);
    }
  };
  const notebooksColumn = (
    <Column addButtonText='+ Notizbuch' onClick={() => {}}>
      {props.notebooks.map(n => (
        <Element
          key={n.title}
          className={n.title === path?.notebookTitle ? 'active' : ''}
          indexTabColor={n.color}
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
            indexTabColor={section.color}
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
    <Container
      className={props.className}
      showHiddenColumns={showHiddenColumns}
    >
      <CollapsedSelectorPane>
        <Header>
          <button
            type='button'
            onClick={() => setShowHiddenColumns(!showHiddenColumns)}
          >
            <FontAwesomeIcon fixedWidth={true} icon={faTimes} />
          </button>
          <span>Notizbücher</span>
          <button type='button'>
            <FontAwesomeIcon fixedWidth={true} icon={faCog} />
          </button>
        </Header>

        <Columns>{notebooksColumn}</Columns>
      </CollapsedSelectorPane>

      <PermanentSelectorPane>
        <Header>
          <button
            type='button'
            onClick={() => setShowHiddenColumns(!showHiddenColumns)}
          >
            <FontAwesomeIcon fixedWidth={true} icon={faBars} />
          </button>
          <span className='notebook-title'>{path.notebookTitle}</span>
          <button type='button'>
            <FontAwesomeIcon fixedWidth={true} icon={faSearch} />
          </button>
        </Header>

        <Columns>
          {sectionsColumn}
          {pagesColumn}
        </Columns>
      </PermanentSelectorPane>
    </Container>
  );
}
