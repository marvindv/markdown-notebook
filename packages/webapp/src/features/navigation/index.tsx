import {
  faBars,
  faCog,
  faSave,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { PagesWithUnsavedChangesTree } from 'src/features/notebooks/notebooksSlice';
import {
  EditingPages,
  EditingSections,
} from 'src/features/notebooks/titleEditingSlice';
import Notebook, { Page, Section } from 'src/models/notebook';
import Path, {
  EmptyPath,
  NotebookPath,
  PagePath,
  SectionPath,
} from 'src/models/path';
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
    color: ${props => props.theme.buttons.themes.secondary.background};
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

export interface Props {
  className?: string;
  path: Path;
  notebooks: Notebook[];
  unsavedPages: PagesWithUnsavedChangesTree;
  onPathChange?: (newPath: Path) => void;
  onNewPage: (path: SectionPath, pageTitle: string) => void;
  onDeletePage: (path: PagePath) => void;
  onChangePageTitle: (path: PagePath, newTitle: string) => void;
  onNewSection: (path: NotebookPath, newTitle: string) => void;
  onDeleteSection: (path: SectionPath) => void;
  onChangeSectionTitle: (path: SectionPath, newTitle: string) => void;
  onNewNotebook: (notebookTitle: string) => void;
  onDeleteNotebook: (path: NotebookPath) => void;
  onChangeNotebookTitle: (path: NotebookPath, newTitle: string) => void;
  titleEditingNotebooks: { [notebookTitle: string]: true };
  onChangeNotebookTitleEditing: (
    path: NotebookPath,
    isEditing: boolean
  ) => void;
  titleEditingSections: EditingSections;
  onChangeSectionTitleEditing: (path: SectionPath, isEditing: boolean) => void;
  titleEditingPages: EditingPages;
  onChangePageTitleEditing: (path: PagePath, isEditing: boolean) => void;
  onSaveClick: (
    path: PagePath | SectionPath | NotebookPath | EmptyPath
  ) => void;
}

/**
 * The navigation panel to display and change the current path in the notebook
 * structure.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function Navigation(props: Props) {
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);

  const path = props.path;

  // Make sure the notebook column is visible if the path is empty.
  useEffect(() => {
    if (!path.notebookTitle) {
      setShowHiddenColumns(true);
    }
  }, [path]);

  const handleSaveAllClick = () => {
    props.onSaveClick({});
  };

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
        {...props}
        path={{
          notebookTitle: path.notebookTitle,
          sectionTitle: path.sectionTitle,
        }}
        onSectionClick={handleSectionClick}
        titleEditingSections={props.titleEditingSections[path.notebookTitle]}
      />
    );
  }

  let pagesColumn;
  if (path.notebookTitle && path.sectionTitle) {
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
        {...props}
        path={{ ...path }}
        titleEditingPages={
          props.titleEditingPages[path.notebookTitle]?.[path.sectionTitle]
        }
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
          {path.notebookTitle ? (
            <button
              type='button'
              onClick={() => setShowHiddenColumns(!showHiddenColumns)}
            >
              <FontAwesomeIcon fixedWidth={true} icon={faTimes} />
            </button>
          ) : (
            <div></div>
          )}

          <span>Notizbücher</span>
          <button type='button'>
            <FontAwesomeIcon fixedWidth={true} icon={faCog} />
          </button>
        </Header>

        <Columns>{notebooksColumn}</Columns>
      </CollapsedSelectorPane>

      <PermanentSelectorPane>
        <Header>
          <div>
            <button
              type='button'
              onClick={() => setShowHiddenColumns(!showHiddenColumns)}
            >
              <FontAwesomeIcon fixedWidth={true} icon={faBars} />
            </button>

            {/*
              Invisible button so the div to the left and the div to the right
              of the notebook title are equal width all the time to make the
              notebook title centered.
            */}
            {Object.keys(props.unsavedPages).length > 0 && (
              <button type='button' style={{ visibility: 'hidden' }}>
                <FontAwesomeIcon fixedWidth={true} icon={faSave} />
              </button>
            )}
          </div>

          <span className='notebook-title'>{path.notebookTitle}</span>

          <div>
            {Object.keys(props.unsavedPages).length > 0 && (
              <button
                type='button'
                title='Alle speichern'
                onClick={handleSaveAllClick}
              >
                <FontAwesomeIcon fixedWidth={true} icon={faSave} />
              </button>
            )}
            <button type='button'>
              <FontAwesomeIcon fixedWidth={true} icon={faSearch} />
            </button>
          </div>
        </Header>

        <Columns>
          {sectionsColumn}
          {pagesColumn}
        </Columns>
      </PermanentSelectorPane>
    </Container>
  );
}
