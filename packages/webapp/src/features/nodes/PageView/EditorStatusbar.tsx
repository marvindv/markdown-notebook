import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Position } from 'monaco-editor';
import React from 'react';
import { Button } from 'src/components';
import styled from 'styled-components';

export const STATUSBAR_PADDING_Y = '0.25rem';
export const STATUSBAR_RELATIVE_FONT_SIZE = 0.75;
export const STATUSBAR_LINE_HEIGHT = '1.15';

const StatusbarButton = styled((props: Parameters<typeof Button>[0]) => (
  <Button {...props} themeColor='secondary' />
))`
  color: white;
  border: 0;
  outline: none;
  border-radius: 0;
`;

const StatusbarToggleButton = (
  props: { isToggled: boolean } & Parameters<typeof Button>[0]
) => (
  <StatusbarButton {...props}>
    {props.isToggled ? (
      <FontAwesomeIcon icon={faCheck} fixedWidth />
    ) : (
      <FontAwesomeIcon icon={faTimes} fixedWidth />
    )}
    &nbsp;
    {props.children}
  </StatusbarButton>
);

const StatusbarLabel = styled.div``;

const Statusbar = styled.div`
  font-size: ${STATUSBAR_RELATIVE_FONT_SIZE * 100}%;
  line-height: ${STATUSBAR_LINE_HEIGHT};
  background-color: ${({ theme }) => theme.baseColors.secondary};
  color: white;
  display: flex;
  padding: 0 0.5rem;

  ${StatusbarButton}, ${StatusbarLabel} {
    padding: ${STATUSBAR_PADDING_Y};
  }

  ${StatusbarButton} + ${StatusbarButton},
  ${StatusbarLabel} + ${StatusbarButton},
  ${StatusbarButton} + ${StatusbarLabel},
  ${StatusbarLabel} + ${StatusbarLabel} {
    margin-left: 0.5rem;
  }
`;

export interface Props {
  className?: string;
  editorPos: Position | null;
  wordWrap: boolean;
  onWordWrapChange: (wordWrap: boolean) => void;
  rulers: number[];
  onRulersChange: (rulers: number[]) => void;
}

export default function EditorStatusbar(props: Props) {
  const {
    className,
    editorPos,
    wordWrap,
    onWordWrapChange,
    rulers,
    onRulersChange,
  } = props;
  return (
    <Statusbar className={className}>
      <StatusbarToggleButton
        isToggled={wordWrap}
        onClick={() => onWordWrapChange(!wordWrap)}
      >
        Word Wrap
      </StatusbarToggleButton>

      <StatusbarToggleButton
        isToggled={rulers.length > 0}
        onClick={() => onRulersChange(rulers.length > 0 ? [] : [80])}
      >
        Ruler
      </StatusbarToggleButton>

      {editorPos ? (
        <StatusbarLabel style={{ marginLeft: 'auto' }}>
          Zeile {editorPos.lineNumber}, Spalte {editorPos.column}
        </StatusbarLabel>
      ) : (
        <StatusbarLabel>&nbsp;</StatusbarLabel>
      )}
    </Statusbar>
  );
}
