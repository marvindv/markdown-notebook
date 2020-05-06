import { unwrapResult } from '@reduxjs/toolkit';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  addEntity,
  changeEntityTitle,
  changePageContent,
  deleteEntity,
  fetchNotebooks,
  saveManyPostsContent,
  savePageContent,
} from 'features/notebooks/notebooksSlice';
import {
  setNotebookEditing,
  setPageEditing,
  setSectionEditing,
} from 'features/notebooks/titleEditingSlice';
import { changeCurrentPath } from 'features/notebooks/currentPathSlice';
import { EmptyPath, NotebookPath, PagePath, SectionPath } from 'models/path';
import {
  findNotebook,
  findPage,
  findSection,
} from 'features/notebooks/selection';
import Navigation from 'Navigation';
import PageView from 'features/notebooks/PageView';
import { RootState } from 'reducers';
import { AppDispatch } from 'store';

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
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNotebooks());
  }, [dispatch]);

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
  // placeholder instead.
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

  return (
    <ContentWrapper>
      <NavigationContainer
        notebooks={notebooks}
        path={path}
        unsavedPages={unsavedPages}
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
        onSaveClick={handleSaveClick}
      />
      {pageContent}
    </ContentWrapper>
  );
}
