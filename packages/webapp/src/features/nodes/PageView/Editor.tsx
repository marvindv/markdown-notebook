import { IDisposable, KeyCode, Position } from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import { useDispatch, useSelector } from 'react-redux';
import { Path } from 'src/models/node';
import { RootState } from 'src/reducers';
import { AppDispatch } from 'src/store';
import styled from 'styled-components';
import { setRulers, setWordWrap } from '../editorSettingsSlice';
import EditorStatusbar, {
  STATUSBAR_LINE_HEIGHT,
  STATUSBAR_PADDING_Y,
  STATUSBAR_RELATIVE_FONT_SIZE,
} from './EditorStatusbar';

const StyledStatusbar = styled(EditorStatusbar)``;

const Container = styled.div`
  // Reduce the height of the whole container by the Statusbar height. The
  // MonacoEditor will use the whole height and the Statusbar overflows the
  // container. The container + the overflowed statusbar has a 100% height.
  // Applying max-height to MonacoEditor does not seem to work.
  max-height: calc(
    100% -
      (
        (2 * ${STATUSBAR_PADDING_Y}) +
          (1rem * ${STATUSBAR_RELATIVE_FONT_SIZE} * ${STATUSBAR_LINE_HEIGHT})
      )
  );

  ${StyledStatusbar} {
    height: calc(
      (2 * ${STATUSBAR_PADDING_Y}) +
        (1rem * ${STATUSBAR_RELATIVE_FONT_SIZE} * ${STATUSBAR_LINE_HEIGHT})
    );
  }
`;

const EDITOR_OPTIONS: EditorConstructionOptions = {
  minimap: { enabled: false },
  lineNumbersMinChars: 3,
  automaticLayout: true,
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

  const wordWrap = useSelector(
    (state: RootState) => state.editorSettings.wordWrap
  );
  const rulers = useSelector((state: RootState) => state.editorSettings.rulers);
  const dispatch: AppDispatch = useDispatch();

  const [editorPos, setEditorPos] = useState<Position | null>(null);
  const editorPosChangeEvent = useRef<IDisposable | null>(null);
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
    if (editorPosChangeEvent.current) {
      editorPosChangeEvent.current.dispose();
    }

    const editor = editorRef.current?.editor;
    if (!editor) {
      return;
    }

    editor.layout();
    setEditorPos(editor.getPosition());
    editorPosChangeEvent.current = editor.onDidChangeCursorPosition(ev =>
      setEditorPos(ev.position)
    );
  }, [editorRef]);

  return (
    <Container className={className}>
      <MonacoEditor
        ref={editorRef}
        language='markdown'
        value={content}
        options={{
          ...EDITOR_OPTIONS,
          rulers,
          wordWrap: wordWrap ? 'on' : 'off',
        }}
        onChange={content => onContentChange(content)}
      />
      <StyledStatusbar
        editorPos={editorPos}
        wordWrap={wordWrap}
        onWordWrapChange={wordWrap => dispatch(setWordWrap(wordWrap))}
        rulers={rulers}
        onRulersChange={rulers => dispatch(setRulers(rulers))}
      />
    </Container>
  );
}
