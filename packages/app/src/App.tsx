import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { addPage, changePageContent } from 'features/notebooks/notebooksSlice';
import { changeCurrentPath } from 'features/path/currentPathSlice';
import { SectionPath } from 'features/path/model';
import Breadcrumbs from './Breadcrumbs';
import { findPage } from './features/notebooks/selection';
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

function App() {
  const notebooks = useSelector((state: RootState) => state.notebooks);
  const path = useSelector((state: RootState) => state.currentPath);
  const dispatch = useDispatch();

  const handleNewPage = (path: SectionPath, title: string) => {
    const notebook = notebooks.find(n => n.title === path.notebookTitle);
    const section = notebook?.sections.find(s => s.title === path.sectionTitle);
    if (section) {
      // Find out if the new page title collides with an existing page.
      let suffixNumber: number | null = null;
      let colission = true;
      while (colission) {
        if (
          section.pages.find(
            p => p.title === title + (suffixNumber ? ` ${suffixNumber}` : '')
          )
        ) {
          suffixNumber = suffixNumber ? suffixNumber + 1 : 2;
        } else {
          colission = false;
        }
      }

      const titleWithSuffix = title + (suffixNumber ? ` ${suffixNumber}` : '');
      dispatch(
        addPage({
          path,
          title: titleWithSuffix,
          content: `# ${titleWithSuffix}`,
        })
      );
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
      />
      {pageContent}
    </ContentWrapper>
  );
}

export default App;
