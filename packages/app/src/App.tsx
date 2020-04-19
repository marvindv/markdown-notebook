import React, { useState } from 'react';
import styled from 'styled-components';

import Notebook from './models/notebook';
import Path, { SectionPath } from './models/path';
import Navigation from './Navigation';
import Breadcrumbs from './Breadcrumbs';
import { DUMMY_NOTEBOOKS, DUMMY_PATH } from './models/dummy-data';
import PageView from './PageView';
import { findPage } from './models/selection';

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
  const [notebooks, setNotebooks] = useState<Notebook[]>(DUMMY_NOTEBOOKS);
  const [path, setPath] = useState<Path>(DUMMY_PATH);

  const handleNewPage = (path: SectionPath, title: string) => {
    const newNotebooks = notebooks.map(n => {
      if (n.title !== path.notebookTitle) {
        return n;
      }

      return {
        ...n,
        sections: n.sections.map(s => {
          if (s.title !== path.sectionTitle) {
            return s;
          }

          // Check for title collision.
          let suffixNumber: number | null = null;
          let colission = true;
          while (colission) {
            if (
              s.pages.find(
                p =>
                  p.title === title + (suffixNumber ? ` ${suffixNumber}` : '')
              )
            ) {
              suffixNumber = suffixNumber ? suffixNumber + 1 : 2;
            } else {
              colission = false;
            }
          }

          const titleWithSuffix =
            title + (suffixNumber ? ` ${suffixNumber}` : '');

          return {
            ...s,
            pages: [
              ...s.pages,
              { title: titleWithSuffix, content: `# ${titleWithSuffix}\n\n` },
            ],
          };
        }),
      };
    });

    setNotebooks(newNotebooks);
  };

  let pageContent;
  if (path.pageTitle) {
    const pathComponents = findPage(path, notebooks);

    if (pathComponents) {
      const { notebook, section, page } = pathComponents;

      const handleContentChange = (newContent: string) => {
        const newNotebooks = notebooks.map(n => {
          if (n !== notebook) {
            return n;
          }

          return {
            ...n,
            sections: n.sections.map(s => {
              if (s !== section) {
                return s;
              }

              return {
                ...s,
                pages: s.pages.map(p => {
                  if (p !== page) {
                    return p;
                  }

                  return { ...p, content: newContent };
                }),
              };
            }),
          };
        });

        setNotebooks(newNotebooks);
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
        onPathChange={path => setPath(path)}
        onNewPage={handleNewPage}
      />
      {pageContent}
    </ContentWrapper>
  );
}

export default App;
