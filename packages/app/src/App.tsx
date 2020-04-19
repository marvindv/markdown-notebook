import React, { useState } from 'react';
import styled from 'styled-components';

import Notebook from './models/notebook';
import Path, { SectionPath } from './models/path';
import Navigation from './Navigation';
import Breadcrumbs from './Breadcrumbs';
import { DUMMY_NOTEBOOKS, DUMMY_PATH } from './models/dummy-data';
import PageView from './PageView';

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
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const PageContent = styled.div`
  flex: 1;
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
    const notebookIndex = notebooks.findIndex(
      n => n.title === path.notebookTitle
    );
    const notebook = notebooks[notebookIndex];
    const sectionIndex = notebook?.sections.findIndex(
      s => s.title === path.sectionTitle
    );
    const section = notebook.sections[sectionIndex];
    const pageIndex = section?.pages.findIndex(p => p.title === path.pageTitle);
    const page = section.pages[pageIndex];
    const handleContentChange = (newContent: string) => {
      const newNotebooks = notebooks.map((n, ni) => {
        if (ni !== notebookIndex) {
          return n;
        }

        return {
          ...n,
          sections: n.sections.map((s, si) => {
            if (si !== sectionIndex) {
              return s;
            }

            return {
              ...s,
              pages: s.pages.map((p, pi) => {
                if (pi !== pageIndex) {
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

    if (page) {
      pageContent = (
        <PageContent>
          <PageView content={page.content} onChange={handleContentChange} />
        </PageContent>
      );
    }
  }

  return (
    <ContentWrapper>
      <NavigationContainer
        notebooks={notebooks}
        path={path}
        onPathChange={path => setPath(path)}
        onNewPage={handleNewPage}
      />
      <PageContainer>
        {<Breadcrumbs path={path} />}
        {pageContent}
      </PageContainer>
    </ContentWrapper>
  );
}

export default App;
