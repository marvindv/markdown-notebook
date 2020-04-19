import React from 'react';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';

export interface Props {
  content: string;
  onChange: (content: string) => void;
}

export default function PageView(props: Props) {
  const options: EditorConstructionOptions = {
    minimap: { enabled: false },
  };
  return (
    <MonacoEditor
      language='markdown'
      value={props.content}
      options={options}
      onChange={content => props.onChange(content)}
    />
  );
}
