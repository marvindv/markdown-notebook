import {
  faBars,
  faCog,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Notebook, { Page, Section } from 'features/notebooks/model';
import Path, { NotebookPath, PagePath, SectionPath } from 'features/path/model';
import React, { useState } from 'react';
import styled from 'styled-components';
import NotebooksColumn from './NotebooksColumn';
import PagesColumn from './PagesColumn';
import SectionsColumn from './SectionsColumn';

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
  onDeletePage: (path: PagePath) => void;
  onChangePageTitle: (path: PagePath, newTitle: string) => void;
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

  const handleNotebookClick = (notebook: Notebook) => {
    // Only emit if actually another notebook selected.
    if (path.notebookTitle !== notebook.title) {
      props.onPathChange?.({
        notebookTitle: notebook.title,
      });
      setShowHiddenColumns(false);
    }
  };
  const notebooksColumn = (
    <NotebooksColumn {...props} onNotebookClick={handleNotebookClick} />
  );

  let sectionsColumn;
  if (path.notebookTitle) {
    const handleSectionClick = (section: Section) => {
      // Only emit if actually another section selected.
      if (path.sectionTitle !== section.title) {
        props.onPathChange?.({
          notebookTitle: path.notebookTitle,
          sectionTitle: section.title,
        });
      }
    };

    sectionsColumn = (
      <SectionsColumn
        {...{ ...props, path: path as NotebookPath }}
        onSectionClick={handleSectionClick}
      />
    );
  }

  let pagesColumn;
  if (path.sectionTitle) {
    const handlePageClick = (page: Page) => {
      // Only emit if actually another page selected.
      if (path.pageTitle !== page.title) {
        props.onPathChange?.({
          ...path,
          pageTitle: page.title,
        });
      }
    };
    pagesColumn = (
      <PagesColumn
        {...{
          ...props,
          path: path as SectionPath,
        }}
        onPageClick={handlePageClick}
      />
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
