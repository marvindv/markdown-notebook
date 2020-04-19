import React, { useState } from 'react';
import styled from 'styled-components';

import Notebook from './models/notebook';
import Path from './models/path';
import Navigation from './Navigation';
import Breadcrumbs from './Breadcrumbs';
import { DUMMY_NOTEBOOKS, DUMMY_PATH } from './models/dummy-data';

const NavigationContainer = styled(Navigation)``;

const ContentWrapper = styled.div`
  display: flex;
  height: 100vh;

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
  overflow: auto;
  font-family: monospace;
  padding: 1rem;
`;

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(DUMMY_NOTEBOOKS);
  const [path, setPath] = useState<Path>(DUMMY_PATH);

  let pageContent;
  if (path.pageTitle) {
    const notebook = notebooks.find(n => n.title === path.notebookTitle);
    const section = notebook?.sections.find(s => s.title === path.sectionTitle);
    const page = section?.pages.find(p => p.title === path.pageTitle);
    pageContent = <PageContent>{page?.content}</PageContent>;
  }

  return (
    <ContentWrapper>
      <NavigationContainer
        notebooks={notebooks}
        path={path}
        onPathChange={path => setPath(path)}
      />
      <PageContainer>
        <Breadcrumbs path={path} />
        {pageContent}
      </PageContainer>
    </ContentWrapper>
  );
}

export default App;
