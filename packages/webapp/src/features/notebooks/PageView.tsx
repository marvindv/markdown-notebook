import 'github-markdown-css';
import { IDisposable, KeyCode, Position } from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import { PagePath } from 'src/models/path';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
`;

const EditorContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const MarkdownContainer = styled.div`
  /* Based on https://github.com/sindresorhus/github-markdown-css#usage */
  .markdown-body {
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;

    @media (max-width: 767px) {
      padding: 15px;
    }
  }

  overflow: auto;
`;

const PageContent = styled.div`
  max-height: 100%;
  overflow: hidden;
  flex: 1;
  display: flex;

  ${EditorContainer}, ${MarkdownContainer} {
    width: 50%;
  }

  ${EditorContainer}:only-child, ${MarkdownContainer}:only-child {
    flex: 1;
    width: 100%;
  }

  ${EditorContainer} + ${MarkdownContainer} {
    border-left: ${props => props.theme.borders.width} solid ${props =>
  props.theme.borders.color}
  }
`;

const EDITOR_OPTIONS: EditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbersMinChars: 3,
  automaticLayout: true,
};

export type ViewMode = 'editor' | 'preview' | 'side-by-side';

export interface Props {
  className?: string;
  content: string;
  path: PagePath;
  viewMode: ViewMode;
  onChange: (content: string) => void;
  onSaveClick: (path: PagePath) => void;
  onSaveAllClick: () => void;
}

export default function PageView(props: Props) {
  const {
    className,
    content,
    path,
    viewMode,
    onChange,
    onSaveClick,
    onSaveAllClick,
  } = props;
  const editorRef = useRef<MonacoEditor>(null);
  const handler = useRef<IDisposable | null>(null);

  // Emit onSaveClick on Ctrl+S keypress and onSaveAllClick on Ctrl+Alt+S.
  // The effect must be reevaluated after path and viewMode changes since this
  // is when the editor is potentionally rerendered.
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      if (!editor) {
        return;
      }

      handler.current = editor.onKeyDown(ev => {
        if (ev.ctrlKey && ev.altKey && ev.keyCode === KeyCode.KEY_S) {
          ev.preventDefault();
          onSaveAllClick();
        } else if (ev.ctrlKey && ev.keyCode === KeyCode.KEY_S) {
          ev.preventDefault();
          onSaveClick(path);
        }
      });
    }

    return () => handler.current?.dispose();
  }, [onSaveClick, onSaveAllClick, path, viewMode]);

  // By default on content change the editor selects the content starting at the
  // length of the previous content. To avoid this set the position to (0, 0) on
  // every path change.
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.setPosition(new Position(0, 0));
  }, [path]);

  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.layout();
  }, [viewMode]);

  return (
    <Container className={className}>
      <PageContent className='PageContent'>
        {(viewMode === 'editor' || viewMode === 'side-by-side') && (
          <EditorContainer>
            <MonacoEditor
              ref={editorRef}
              language='markdown'
              value={content}
              options={EDITOR_OPTIONS}
              onChange={content => onChange(content)}
            />
          </EditorContainer>
        )}
        {/*
          apply https://github.com/sindresorhus/github-markdown-css with
          .markdown-body
        */}
        {(viewMode === 'preview' || viewMode === 'side-by-side') && (
          <MarkdownContainer>
            <div className='markdown-body'>
              <ReactMarkdown source={content} />
            </div>
          </MarkdownContainer>
        )}
      </PageContent>
    </Container>
  );
}
