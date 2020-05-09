import { IDisposable, KeyCode } from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import { PagePath } from 'src/models/path';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PageContent = styled.div`
  flex: 1;
`;

const EDITOR_OPTIONS: EditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbersMinChars: 3,
  automaticLayout: true,
};

export interface Props {
  className?: string;
  content: string;
  path: PagePath;
  onChange: (content: string) => void;
  onSaveClick: (path: PagePath) => void;
}

export default function PageView(props: Props) {
  const { className, content, path, onChange, onSaveClick } = props;
  const editorRef = useRef<MonacoEditor | null>(null);
  const handler = useRef<IDisposable | null>(null);
  useEffect(() => {
    if (editorRef) {
      const editor = editorRef.current?.editor;
      if (!editor) {
        return;
      }

      handler.current = editor.onKeyDown(ev => {
        if (ev.ctrlKey && ev.keyCode === KeyCode.KEY_S) {
          ev.preventDefault();
          onSaveClick(path);
        }
      });
    }

    return () => handler.current?.dispose();
  }, [onSaveClick, path]);

  return (
    <Container className={className}>
      <PageContent className='PageContent'>
        <MonacoEditor
          ref={editorRef}
          language='markdown'
          value={content}
          options={EDITOR_OPTIONS}
          onChange={content => onChange(content)}
        />
      </PageContent>
    </Container>
  );
}
