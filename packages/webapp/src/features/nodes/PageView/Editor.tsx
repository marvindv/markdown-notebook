import { IDisposable, KeyCode, Position } from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import { Path } from 'src/models/node';
import styled from 'styled-components';

const Container = styled.div``;

const EDITOR_OPTIONS: EditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbersMinChars: 3,
  automaticLayout: true,
  wordWrap: 'on',
};

export interface Props {
  className?: string;
  path: Path;
  content: string;
  onContentChange: (newContent: string) => void;
  onSave: () => void;
  onSaveAll: () => void;
}

export default function Editor(props: Props) {
  const {
    className,
    path,
    content,
    onContentChange,
    onSave,
    onSaveAll,
  } = props;

  const editorRef = useRef<MonacoEditor>(null);
  const handler = useRef<IDisposable | null>(null);

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
          onSaveAll();
        } else if (ev.ctrlKey && ev.keyCode === KeyCode.KEY_S) {
          ev.preventDefault();
          onSave();
        }
      });
    }

    return () => handler.current?.dispose();
  }, [onSave, onSaveAll, path]);

  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.layout();
  }, [editorRef]);

  return (
    <Container className={className}>
      <MonacoEditor
        ref={editorRef}
        language='markdown'
        value={content}
        options={EDITOR_OPTIONS}
        onChange={content => onContentChange(content)}
      />
    </Container>
  );
}
