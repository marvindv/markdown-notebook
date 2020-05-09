import React from 'react';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import Breadcrumbs from 'src/features/navigation/Breadcrumbs';
import Path from 'src/models/path';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PageContent = styled.div`
  flex: 1;
`;

export interface Props {
  className?: string;
  path: Path;
  hasUnsavedChanges: boolean;
  content: string;
  onChange: (content: string) => void;
}

export default function PageView(props: Props) {
  const options: EditorConstructionOptions = {
    minimap: { enabled: false },
    lineNumbersMinChars: 3,
    automaticLayout: true,
  };
  return (
    <Container className={props.className}>
      <div>
        <Breadcrumbs
          path={props.path}
          unsavedChangesIndicator={props.hasUnsavedChanges}
        />
      </div>

      <PageContent className='PageContent'>
        <MonacoEditor
          language='markdown'
          value={props.content}
          options={options}
          onChange={content => props.onChange(content)}
        />
      </PageContent>
    </Container>
  );
}
