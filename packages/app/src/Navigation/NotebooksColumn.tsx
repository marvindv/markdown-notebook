import Notebook from 'features/notebooks/model';
import Path from 'features/path/model';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  notebooks: Notebook[];
  path: Path;
  onNotebookClick: (notebook: Notebook) => void;
}

export default function NotebooksColumn(props: Props) {
  const { notebooks, path, onNotebookClick } = props;

  return (
    <Column addButtonText='+ Notizbuch' onAddClick={() => {}}>
      {notebooks.map(n => (
        <Element
          key={n.title}
          className={n.title === path.notebookTitle ? 'active' : ''}
          label={n.title}
          indexTabColor={n.color}
          onClick={() => onNotebookClick(n)}
        />
      ))}
    </Column>
  );
}
