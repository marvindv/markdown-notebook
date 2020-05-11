import {
  faChevronLeft,
  faCircleNotch,
  faColumns,
  faEdit,
  faExclamationTriangle,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import Button from 'src/components/Button';
import ButtonGroup from 'src/components/ButtonGroup';
import Navigation, { Header } from 'src/features/navigation';
import Breadcrumbs from 'src/features/navigation/Breadcrumbs';
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
import PageView, { ViewMode } from 'src/features/notebooks/PageView';
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
import useEventListener from 'src/hooks/useEventListener';
import Path, {
  EmptyPath,
  NotebookPath,
  PagePath,
  SectionPath,
} from 'src/models/path';
import { RootState } from 'src/reducers';
import { AppDispatch } from 'src/store';
import styled, { css } from 'styled-components';

// The screens max width to which the mobile view of the NotebooksPage should
// be used.
const MOBILE_VIEW_MAX_WIDTH_PX = 768;

const PageViewModeButtonGroup = styled(ButtonGroup)``;

const BackButton = styled(Button)`
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  margin-left: calc(-0.5rem - ${props => props.theme.buttons.borderWidth});
`;

const PageBreadcrumbs = styled(Breadcrumbs)``;

const PageHeader = styled(Header)`
  display: grid;
  grid-template-columns: fit-content(100%) auto fit-content(100%);

  ${PageBreadcrumbs} {
    overflow: hidden;
  }

  ${PageViewModeButtonGroup} {
    grid-column: 3;
  }

  @media (min-width: ${MOBILE_VIEW_MAX_WIDTH_PX + 1}px) {
    ${BackButton} {
      display: none;
    }
  }

  ${BackButton}, ${PageBreadcrumbs} {
    font-size: 100%;
  }

  padding-left: ${props => props.theme.buttons.paddingX};
  padding-right: ${props => props.theme.buttons.paddingX};
`;

const NavigationContainer = styled(Navigation)``;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;

  // Slightly adjusted material depth 3 shadow.
  // From https://codepen.io/sdthornton/pen/wBZdXq
  box-shadow: 0 0px 20px rgba(0, 0, 0, 0.19), 0 0px 6px rgba(0, 0, 0, 0.23);
  z-index: 1;
`;

const ContentWrapper = styled.div<{ focusPageContainer?: boolean }>`
  display: flex;
  height: 100%;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEW_MAX_WIDTH_PX}px) {
    ${NavigationContainer}, ${PageContainer} {
      width: 100%;
    }

    ${props =>
      props.focusPageContainer
        ? css`
            ${NavigationContainer} {
              display: none;
            }
          `
        : css`
            ${PageContainer} {
              display: none;
            }
          `}
  }

  @media (min-width: ${MOBILE_VIEW_MAX_WIDTH_PX + 1}px) {
    ${NavigationContainer} {
      width: 25%;
    }

    ${PageContainer} {
      width: 75%;

      /* For loading screen and fetch error display. */
      &:only-child {
        width: 100%;
      }
    }
  }
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
  const hasUnsavedPages = useSelector(
    (state: RootState) =>
      state.notebooks.unsavedPages &&
      Object.keys(state.notebooks.unsavedPages).length > 0
  );
  const isSavePending = useSelector(
    (state: RootState) => state.notebooks.savePending
  );
  const isFetching = useSelector(
    (state: RootState) => state.notebooks.isFetching
  );
  const fetchError = useSelector(
    (state: RootState) => state.notebooks.fetchError
  );
  const dispatch: AppDispatch = useDispatch();
  // State that specifies whether the page should is focused. If the mobile view
  // is active, the navigation is hidden.
  const [focusPageContainer, setFocusPageContainer] = useState(false);
  const [pageViewMode, setPageViewMode] = useState<ViewMode>('editor');

  // Memoize this event handler, since its passed to PageView were it is used in
  // an effect.
  const handleSaveClick = useCallback(
    async (path: PagePath | SectionPath | NotebookPath | EmptyPath = {}) => {
      const resultAction =
        path.pageTitle === undefined
          ? await dispatch(
              saveManyPostsContent({
                path,
              })
            )
          : await dispatch(savePageContent({ path }));
      if (savePageContent.rejected.match(resultAction)) {
        // An error toast will be triggered by the reducer for
        // savePageContent.rejected so nothing todo here for now.
      }
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchNotebooks());
  }, [dispatch]);

  // Prevent reload and navigation as long as there are unsaved changes.
  useEventListener(window, 'beforeunload', ev => {
    if (!hasUnsavedPages) {
      return;
    }

    // No browser supports custom confirm messages anymore like in
    // https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes/7317311#7317311
    // described, so no need to bother.
    ev.returnValue = false;
    return false;
  });

  // Keep track on whether we are in the mobile view or not so we can use this
  // information outside of css.
  const [isMobileView, setIsMobileView] = useState(false);
  useEventListener(window, 'resize', ev => {
    const inMobileWidth = window.innerWidth <= MOBILE_VIEW_MAX_WIDTH_PX;
    if (inMobileWidth !== isMobileView) {
      setIsMobileView(inMobileWidth);
    }
  });
  // Whenever we go from non mobile to mobile view we go into preview view since
  // editor doesn't work that well on mobile and we assume this is what the user
  // want. Also split screen is entirely disabled on mobile.
  useEffect(() => {
    if (isMobileView) {
      setPageViewMode('preview');
    }
  }, [isMobileView]);
  // Set the initial value for isMobileView once.
  useEffect(() => {
    setIsMobileView(window.innerWidth <= MOBILE_VIEW_MAX_WIDTH_PX);
  }, []);

  const handleNewPage = async (path: SectionPath, title: string) => {
    const { section } = findSection(path, notebooks) || {};
    if (section) {
      const collisionFreeTitle = getCollisionFreeTitle(
        title,
        section.pages.map(p => p.title)
      );
      // Add the page, set it as current and go right into editing mode after
      // its added.
      const resultAction = await dispatch(
        addEntity({
          path: {
            ...path,
            pageTitle: collisionFreeTitle,
          },
        })
      );
      if (addEntity.fulfilled.match(resultAction)) {
        // Use the path as returned from the backend in case the page title
        // was altered by the backend.
        const { actualPath } = unwrapResult(resultAction);
        dispatch(changeCurrentPath(actualPath));
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

      // Add the entity and after that has been done, set the section as the
      // current section and set the editing mode for that section.
      const resultAction = await dispatch(
        addEntity({
          path: {
            ...path,
            sectionTitle: collisionFreeTitle,
          },
        })
      );
      if (addEntity.fulfilled.match(resultAction)) {
        // Use the path as returned from the backend in case the section title
        // was altered by the backend.
        const { actualPath } = unwrapResult(resultAction);
        dispatch(changeCurrentPath(actualPath));
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
    // Add the notebook, set it as current and go right into editing mode after
    // its added.
    const resultAction = await dispatch(
      addEntity({
        path: {
          notebookTitle: collisionFreeTitle,
        },
      })
    );
    if (addEntity.fulfilled.match(resultAction)) {
      // Use the path as returned from the backend in case the notebook title
      // was altered by the backend.
      const { actualPath } = unwrapResult(resultAction);
      // TODO: As soon as its possible to do, set isEditing for the new notebook
      // and *after* the title has been edited set it as the current path. The
      // navigation must also handle this correctly and display the section list
      // of the new notebook.
      // dispatch(changeCurrentPath(actualPath));
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

  const handleChangeTitle = (path: Path, newTitle: string) => {
    dispatch(
      changeEntityTitle({
        path,
        newTitle,
      })
    );
  };

  const handleDelete = (path: Path) => dispatch(deleteEntity(path));

  // If we are currently fetching or fetching failed with an error, show the
  // corresponding hints, since there are no notebooks to render.
  if (isFetching) {
    return (
      <ContentWrapper>
        <PageContainer>
          <NoPageNotice>
            <div>Notizbücher werden geladen &hellip;</div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
              }}
            >
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
            <div
              style={{
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
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
        dispatch(
          changePageContent({
            path,
            content: newContent,
          })
        );
      };

      const hasUnsavedChanges = !!unsavedPages[path.notebookTitle]?.[
        path.sectionTitle
      ]?.[path.pageTitle];

      pageContent = (
        <PageContainer>
          <PageHeader>
            <BackButton
              themeColor='secondary'
              clear={true}
              onClick={() => setFocusPageContainer(false)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </BackButton>

            <PageBreadcrumbs
              path={path}
              unsavedChangesIndicator={hasUnsavedChanges}
              showOnlyLast={isMobileView}
            />

            <PageViewModeButtonGroup>
              <Button
                active={pageViewMode === 'editor'}
                themeColor='light'
                onClick={() => setPageViewMode('editor')}
              >
                <FontAwesomeIcon icon={faEdit} fixedWidth />
              </Button>
              <Button
                active={pageViewMode === 'preview'}
                themeColor='light'
                onClick={() => setPageViewMode('preview')}
              >
                <FontAwesomeIcon icon={faSearch} fixedWidth />
              </Button>
              {/*
                Hide split screen button on mobile since it doesn't really work
                on mobile.
              */}
              {!isMobileView && (
                <Button
                  active={pageViewMode === 'side-by-side'}
                  themeColor='light'
                  onClick={() => setPageViewMode('side-by-side')}
                >
                  <FontAwesomeIcon icon={faColumns} fixedWidth />
                </Button>
              )}
            </PageViewModeButtonGroup>
          </PageHeader>
          <PageView
            path={path}
            content={page.content}
            viewMode={pageViewMode}
            onChange={handleContentChange}
            onSaveClick={handleSaveClick}
            onSaveAllClick={handleSaveClick}
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

  return (
    <>
      <Prompt
        when={hasUnsavedPages}
        message='Du hast ungespeicherte Änderungen. Diese gehen verloren, wenn du diese Seite verlässt.'
      />
      <ContentWrapper focusPageContainer={focusPageContainer}>
        <NavigationContainer
          notebooks={notebooks}
          path={path}
          unsavedPages={unsavedPages}
          savePending={isSavePending}
          onPathChange={path => dispatch(changeCurrentPath(path))}
          onPageClick={() => setFocusPageContainer(true)}
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
            dispatch(
              setNotebookEditing({
                path,
                isEditing,
              })
            )
          }
          titleEditingSections={titleEditing.sections}
          onChangeSectionTitleEditing={(path, isEditing) =>
            dispatch(
              setSectionEditing({
                path,
                isEditing,
              })
            )
          }
          titleEditingPages={titleEditing.pages}
          onChangePageTitleEditing={(path, isEditing) =>
            dispatch(
              setPageEditing({
                path,
                isEditing,
              })
            )
          }
          onSaveClick={handleSaveClick}
        />
        {pageContent}
      </ContentWrapper>
    </>
  );
}
