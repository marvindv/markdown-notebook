import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Position } from 'monaco-editor';
import React from 'react';
import { Button } from 'src/components';
import styled from 'styled-components';

const StatusBarButton = styled((props: Parameters<typeof Button>[0]) => (
  <Button {...props} themeColor='secondary' />
))`
  color: white;
  border: 0;
  outline: none;
  border-radius: 0;
`;

const StatusBarToggleButton = (
  props: { isToggled: boolean } & Parameters<typeof Button>[0]
) => (
  <StatusBarButton {...props}>
    {props.isToggled ? (
      <FontAwesomeIcon icon={faCheck} fixedWidth />
    ) : (
      <FontAwesomeIcon icon={faTimes} fixedWidth />
    )}
    &nbsp;
    {props.children}
  </StatusBarButton>
);

const StatusBarLabel = styled.div``;

const StatusBar = styled.div`
  font-size: ${({ theme }) => theme.typo.fontSizeSm};
  background-color: ${({ theme }) => theme.baseColors.secondary};
  color: white;
  display: flex;
  padding: 0 0.5rem;

  ${StatusBarButton}, ${StatusBarLabel} {
    padding: 0.25rem;
  }

  ${StatusBarButton} + ${StatusBarButton},
  ${StatusBarLabel} + ${StatusBarButton},
  ${StatusBarButton} + ${StatusBarLabel},
  ${StatusBarLabel} + ${StatusBarLabel} {
    margin-left: 0.5rem;
  }
`;

export interface Props {
  editorPos: Position | null;
  wordWrap: boolean;
  onWordWrapChange: (wordWrap: boolean) => void;
  rulers: number[];
  onRulersChange: (rulers: number[]) => void;
}

export default function EditorStatusbar(props: Props) {
  const {
    editorPos,
    wordWrap,
    onWordWrapChange,
    rulers,
    onRulersChange,
  } = props;
  return (
    <StatusBar>
      <StatusBarToggleButton
        isToggled={wordWrap}
        onClick={() => onWordWrapChange(!wordWrap)}
      >
        Word Wrap
      </StatusBarToggleButton>

      <StatusBarToggleButton
        isToggled={rulers.length > 0}
        onClick={() => onRulersChange(rulers.length > 0 ? [] : [80])}
      >
        Ruler
      </StatusBarToggleButton>

      {editorPos ? (
        <StatusBarLabel style={{ marginLeft: 'auto' }}>
          Zeile {editorPos.lineNumber}, Spalte {editorPos.column}
        </StatusBarLabel>
      ) : (
        <StatusBarLabel>&nbsp;</StatusBarLabel>
      )}
    </StatusBar>
  );
}
