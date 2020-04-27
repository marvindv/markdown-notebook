import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  addEntity,
  changeEntityTitle,
  changePageContent,
  deleteEntity,
} from 'features/notebooks/notebooksSlice';
import {
  setNotebookEditing,
  setPageEditing,
  setSectionEditing,
} from 'features/notebooks/titleEditingSlice';
import { changeCurrentPath } from 'features/path/currentPathSlice';
import { NotebookPath, SectionPath } from 'models/path';
import Breadcrumbs from './Breadcrumbs';
import {
  findNotebook,
  findPage,
  findSection,
} from './features/notebooks/selection';
import Navigation from './Navigation';
import PageView from './PageView';
import { RootState } from './reducers';

const NavigationContainer = styled(Navigation)``;

const ContentWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;

  ${NavigationContainer} {
    flex: 1;
  }
`;

const PageContainer = styled.div`
  flex: 2;

  display: flex;
  flex-direction: column;
  // Slightly adjusted material depth 3 shadow.
  // From https://codepen.io/sdthornton/pen/wBZdXq
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.19), 0 0px 6px rgba(0, 0, 0, 0.23);
  z-index: 1;
`;

const PageContent = styled.div`
  flex: 1;
`;

const NoPageNotice = styled.div`
  flex: 0;
  margin: auto;
  color: ${props => props.theme.typo.mutedColor};
`;

function getCollisionFreeTitle(title: string, existing: string[]): string {
  let suffixNumber: number | null = null;
  const titleWithSuffix = () =>
    title + (suffixNumber ? ' ' + suffixNumber : '');
  let collision = true;
  while (collision) {
    const currentTitle = titleWithSuffix();
    if (existing.find(s => s === currentTitle)) {
      suffixNumber = suffixNumber ? suffixNumber + 1 : 2;
    } else {
      collision = false;
    }
  }

  return titleWithSuffix();
}

function App() {
  const notebooks = useSelector(
    (state: RootState) => state.notebooks.notebooks
  );
  const path = useSelector((state: RootState) => state.currentPath);
  const titleEditing = useSelector((state: RootState) => state.titleEditing);
  const dispatch = useDispatch();

  const handleNewPage = (path: SectionPath, title: string) => {
    const { section } = findSection(path, notebooks) || {};
    if (section) {
      const collisionFreeTitle = getCollisionFreeTitle(
        title,
        section.pages.map(p => p.title)
      );
      dispatch(addEntity({ path: { ...path, pageTitle: collisionFreeTitle } }));
      dispatch(
        setPageEditing({
          path: { ...path, pageTitle: collisionFreeTitle },
          isEditing: true,
        })
      );
    }
  };

  const handleNewSection = (path: NotebookPath, newTitle: string) => {
    console.warn(path);
    const notebook = findNotebook(path, notebooks);
    if (notebook) {
      const collisionFreeTitle = getCollisionFreeTitle(
        newTitle,
        notebook.sections.map(n => n.title)
      );
      dispatch(
        addEntity({ path: { ...path, sectionTitle: collisionFreeTitle } })
      );
      dispatch(
        setSectionEditing({
          path: { ...path, sectionTitle: collisionFreeTitle },
          isEditing: true,
        })
      );
    }
  };

  const handleNewNotebook = (newTitle: string) => {
    const collisionFreeTitle = getCollisionFreeTitle(
      newTitle,
      notebooks.map(n => n.title)
    );
    dispatch(addEntity({ path: { notebookTitle: collisionFreeTitle } }));
    dispatch(
      setNotebookEditing({
        path: { notebookTitle: collisionFreeTitle },
        isEditing: true,
      })
    );
  };

  let pageContent;
  if (path.pageTitle) {
    const pathComponents = findPage(path, notebooks);
    if (pathComponents) {
      const { page } = pathComponents;

      const handleContentChange = (newContent: string) => {
        dispatch(changePageContent({ path, content: newContent }));
      };

      pageContent = (
        <PageContainer>
          <Breadcrumbs path={path} />
          <PageContent>
            <PageView content={page.content} onChange={handleContentChange} />
          </PageContent>
        </PageContainer>
      );
    }
  }

  // If we have no path or the path does not match any page, display a
  // placeholder instead.
  if (!pageContent) {
    let text;
    if (!path.sectionTitle) {
      text = 'Wähle einen Abschnitt aus.';
    } else {
      text = 'Wähle eine Seite aus.';
    }

    pageContent = (
      <PageContainer>
        <NoPageNotice>{text}</NoPageNotice>
      </PageContainer>
    );
  }

  return (
    <ContentWrapper>
      <NavigationContainer
        notebooks={notebooks}
        path={path}
        onPathChange={path => dispatch(changeCurrentPath(path))}
        onNewPage={handleNewPage}
        onDeletePage={path => dispatch(deleteEntity(path))}
        onChangePageTitle={(path, newTitle) =>
          dispatch(changeEntityTitle({ path, newTitle }))
        }
        onNewSection={handleNewSection}
        onDeleteSection={path => dispatch(deleteEntity(path))}
        onChangeSectionTitle={(path, newTitle) =>
          dispatch(changeEntityTitle({ path, newTitle }))
        }
        onNewNotebook={handleNewNotebook}
        onDeleteNotebook={path => dispatch(deleteEntity(path))}
        onChangeNotebookTitle={(path, newTitle) =>
          dispatch(changeEntityTitle({ path, newTitle }))
        }
        titleEditingNotebooks={titleEditing.notebooks}
        onChangeNotebookTitleEditing={(path, isEditing) =>
          dispatch(setNotebookEditing({ path, isEditing }))
        }
        titleEditingSections={titleEditing.sections}
        onChangeSectionTitleEditing={(path, isEditing) =>
          dispatch(setSectionEditing({ path, isEditing }))
        }
        titleEditingPages={titleEditing.pages}
        onChangePageTitleEditing={(path, isEditing) =>
          dispatch(setPageEditing({ path, isEditing }))
        }
      />
      {pageContent}
    </ContentWrapper>
  );
}

export default App;
