import {
  faChevronLeft,
  faCircleNotch,
  faColumns,
  faEdit,
  faExclamationTriangle,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { Button, ButtonGroup } from 'src/components';
import Breadcrumbs from 'src/features/navigation/Breadcrumbs';
import Navigation, { Header } from 'src/features/navigation/Navigation';
import useEventListener from 'src/hooks/useEventListener';
import { Path } from 'src/models/node';
import { RootState } from 'src/reducers';
import {
  getCurrentNode,
  getHasCurrentNodeUnsavedChanges,
  getHasUnsavedChanges,
} from 'src/selectors';
import { AppDispatch } from 'src/store';
import styled, { css } from 'styled-components';
import {
  changePageContent,
  fetchNodes,
  saveManyPagesContent,
  savePageContent,
} from './nodesSlice';
import PageView, { ViewMode } from './PageView';

// The screens max width to which the mobile view of the NotebookPage should
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

const StyledNavigation = styled(Navigation)``;

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
    ${StyledNavigation}, ${PageContainer} {
      width: 100%;
    }

    ${props =>
      props.focusPageContainer
        ? css`
            ${StyledNavigation} {
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
    ${StyledNavigation} {
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

export default function NotebookPage(): JSX.Element {
  const dispatch: AppDispatch = useDispatch();
  // State that specifies whether the page should is focused. If the mobile view
  // is active, the navigation is hidden.
  const [focusPageContainer, setFocusPageContainer] = useState(false);
  const [pageViewMode, setPageViewMode] = useState<ViewMode>('editor');
  const isFetching = useSelector((state: RootState) => state.nodes.isFetching);
  const fetchError = useSelector((state: RootState) => state.nodes.fetchError);
  const path = useSelector((state: RootState) => state.currentPath);
  const currentNode = useSelector(getCurrentNode);
  const hasUnsavedNodes = useSelector(getHasUnsavedChanges);
  const hasCurrentPageUnsavedChanges = useSelector(
    getHasCurrentNodeUnsavedChanges
  );

  // Memoize this event handler, since its passed to PageView were it is used in
  // an effect.
  const handleSaveClick = useCallback(
    async (path: Path = []) => {
      const resultAction = await dispatch(savePageContent({ path }));
      if (saveManyPagesContent.rejected.match(resultAction)) {
        // An error toast will be triggered by the reducer for
        // savePageContent.rejected so nothing todo here for now.
        console.error(resultAction);
      }
    },
    [dispatch]
  );

  const handleSaveAllClick = useCallback(async () => {
    const resultAction = await dispatch(saveManyPagesContent({ path: [] }));
    if (saveManyPagesContent.rejected.match(resultAction)) {
      // An error toast will be triggered by the reducer for
      // savePageContent.rejected so nothing todo here for now.
      console.error(resultAction);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNodes());
  }, [dispatch]);

  // Prevent reload and navigation as long as there are unsaved changes.
  useEventListener(window, 'beforeunload', ev => {
    if (!hasUnsavedNodes) {
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

  // If we are currently fetching or fetching failed with an error, show the
  // corresponding hints, since there are no notebooks to render.
  if (isFetching) {
    return (
      <ContentWrapper>
        <PageContainer>
          <NoPageNotice>
            <div>Notizen werden geladen &hellip;</div>
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
            <div>Notizen konnten nicht geladen werden</div>
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
  if (currentNode?.isDirectory === false) {
    pageContent = (
      <>
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
            unsavedChangesIndicator={hasCurrentPageUnsavedChanges}
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
          content={currentNode.content}
          viewMode={pageViewMode}
          onChange={content => dispatch(changePageContent({ path, content }))}
          onSaveClick={handleSaveClick}
          onSaveAllClick={handleSaveAllClick}
        />
      </>
    );
  } else {
    pageContent = <NoPageNotice>Wähle eine Notiz aus.</NoPageNotice>;
  }

  return (
    <>
      <Prompt
        when={hasUnsavedNodes}
        message='Du hast ungespeicherte Änderungen. Diese gehen verloren, wenn du diese Seite verlässt.'
      />

      <ContentWrapper focusPageContainer={focusPageContainer}>
        <StyledNavigation onFileClick={() => setFocusPageContainer(true)} />
        <PageContainer>{pageContent}</PageContainer>
      </ContentWrapper>
    </>
  );
}
