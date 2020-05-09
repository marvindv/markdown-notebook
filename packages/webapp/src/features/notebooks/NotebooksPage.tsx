import {
  faCircleNotch,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'src/components/Button';
import Navigation from 'src/features/navigation';
import { changeCurrentPath } from 'src/features/navigation/currentPathSlice';
import {
  addEntity,
  changeEntityTitle,
  changePageContent,
  deleteEntity,
  fetchNotebooks,
  saveManyPostsContent,
  savePageContent,
} from 'src/features/notebooks/notebooksSlice';
import PageView from 'src/features/notebooks/PageView';
import {
  findNotebook,
  findPage,
  findSection,
} from 'src/features/notebooks/selection';
import {
  setNotebookEditing,
  setPageEditing,
  setSectionEditing,
} from 'src/features/notebooks/titleEditingSlice';
import Path, {
  EmptyPath,
  NotebookPath,
  PagePath,
  SectionPath,
} from 'src/models/path';
import { RootState } from 'src/reducers';
import { AppDispatch } from 'src/store';
import styled from 'styled-components';

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
export default function NotebooksPage() {
  const notebooks = useSelector(
    (state: RootState) => state.notebooks.notebooks
  );
  const path = useSelector((state: RootState) => state.currentPath);
  const titleEditing = useSelector((state: RootState) => state.titleEditing);
  const unsavedPages = useSelector(
    (state: RootState) => state.notebooks.unsavedPages
  );
  const isFetching = useSelector(
    (state: RootState) => state.notebooks.isFetching
  );
  const fetchError = useSelector(
    (state: RootState) => state.notebooks.fetchError
  );
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotebooks());
  }, [dispatch]);

  // If we are currently fetching or fetching failed with an error, show the
  // corresponding hints, since there are no notebooks to render.
  if (isFetching) {
    return (
      <ContentWrapper>
        <PageContainer>
          <NoPageNotice>
            <div>Notizbücher werden geladen &hellip;</div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <FontAwesomeIcon icon={faCircleNotch} size='2x' spin />
            </div>
          </NoPageNotice>
        </PageContainer>
      </ContentWrapper>
    );
  } else if (fetchError) {
    return (
      <ContentWrapper>
        <PageContainer>
          <NoPageNotice>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} size='2x' />
            </div>
            <div>Notizbücher konnten nicht geladen werden</div>
            <small
              style={{
                textAlign: 'center',
                display: 'block',
                marginTop: '0.25rem',
              }}
            >
              {fetchError}
            </small>
          </NoPageNotice>
        </PageContainer>
      </ContentWrapper>
    );
  }

  let pageContent;
  if (path.pageTitle) {
    const pathComponents = findPage(path, notebooks);
    if (pathComponents) {
      const { page } = pathComponents;

      const handleContentChange = (newContent: string) => {
        dispatch(changePageContent({ path, content: newContent }));
      };

      const hasUnsavedChanges = !!unsavedPages[path.notebookTitle]?.[
        path.sectionTitle
      ]?.[path.pageTitle];

      pageContent = (
        <PageContainer>
          <PageView
            path={path}
            hasUnsavedChanges={hasUnsavedChanges}
            content={page.content}
            onChange={handleContentChange}
          />
        </PageContainer>
      );
    }
  }

  // If we have no path or the path does not match any page, display a
  // placeholder instead. If we are still fetching the notebooks, show a loading
  // indicator.
  if (!pageContent) {
    let text;
    if (!path.notebookTitle) {
      text = 'Wähle ein Notizbuch aus.';
    } else if (!path.sectionTitle) {
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

  const handleNewPage = async (path: SectionPath, title: string) => {
    const { section } = findSection(path, notebooks) || {};
    if (section) {
      const collisionFreeTitle = getCollisionFreeTitle(
        title,
        section.pages.map(p => p.title)
      );
      // Add the page and go right into editing mode after its added.
      const resultAction = await dispatch(
        addEntity({ path: { ...path, pageTitle: collisionFreeTitle } })
      );
      if (addEntity.fulfilled.match(resultAction)) {
        // Use the path as returned from the backend in case the page title
        // was altered by the backend.
        const { actualPath } = unwrapResult(resultAction);
        dispatch(
          setPageEditing({
            path: actualPath as PagePath,
            isEditing: true,
          })
        );
      } else {
        // An error toast will be triggered by the reducer for
        // addEntity.rejected so nothing todo here for now.
      }
    }
  };

  const handleNewSection = async (path: NotebookPath, newTitle: string) => {
    const notebook = findNotebook(path, notebooks);
    if (notebook) {
      const collisionFreeTitle = getCollisionFreeTitle(
        newTitle,
        notebook.sections.map(n => n.title)
      );

      // Add the entity and after that has been done, set the editing mode for
      // that section.
      const resultAction = await dispatch(
        addEntity({
          path: { ...path, sectionTitle: collisionFreeTitle },
        })
      );
      if (addEntity.fulfilled.match(resultAction)) {
        // Use the path as returned from the backend in case the section title
        // was altered by the backend.
        const { actualPath } = unwrapResult(resultAction);
        dispatch(
          setSectionEditing({
            path: actualPath as SectionPath,
            isEditing: true,
          })
        );
      } else {
        // An error toast will be triggered by the reducer for
        // addEntity.rejected so nothing todo here for now.
      }
    }
  };

  const handleNewNotebook = async (newTitle: string) => {
    const collisionFreeTitle = getCollisionFreeTitle(
      newTitle,
      notebooks.map(n => n.title)
    );
    // Add the notebook and go right into editing mode after its added.
    const resultAction = await dispatch(
      addEntity({ path: { notebookTitle: collisionFreeTitle } })
    );
    if (addEntity.fulfilled.match(resultAction)) {
      // Use the path as returned from the backend in case the notebook title
      // was altered by the backend.
      const { actualPath } = unwrapResult(resultAction);
      dispatch(
        setNotebookEditing({
          path: actualPath as NotebookPath,
          isEditing: true,
        })
      );
    } else {
      // An error toast will be triggered by the reducer for
      // addEntity.rejected so nothing todo here for now.
    }
  };

  const handleSaveClick = async (
    path: PagePath | SectionPath | NotebookPath | EmptyPath
  ) => {
    const resultAction =
      path.pageTitle === undefined
        ? await dispatch(saveManyPostsContent({ path }))
        : await dispatch(savePageContent({ path }));
    if (savePageContent.rejected.match(resultAction)) {
      // An error toast will be triggered by the reducer for
      // savePageContent.rejected so nothing todo here for now.
    }
  };

  const handleChangeTitle = (path: Path, newTitle: string) => {
    dispatch(changeEntityTitle({ path, newTitle }));
  };

  const handleDelete = (path: Path) => dispatch(deleteEntity(path));

  return (
    <ContentWrapper>
      <NavigationContainer
        notebooks={notebooks}
        path={path}
        unsavedPages={unsavedPages}
        onPathChange={path => dispatch(changeCurrentPath(path))}
        onNewPage={handleNewPage}
        onDeletePage={handleDelete}
        onChangePageTitle={handleChangeTitle}
        onNewSection={handleNewSection}
        onDeleteSection={handleDelete}
        onChangeSectionTitle={handleChangeTitle}
        onNewNotebook={handleNewNotebook}
        onDeleteNotebook={handleDelete}
        onChangeNotebookTitle={handleChangeTitle}
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
        onSaveClick={handleSaveClick}
      />
      {pageContent}
    </ContentWrapper>
  );
}
