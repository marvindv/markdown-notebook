import Notebook from 'features/notebooks/model';
import Path, { NotebookPath } from 'features/path/model';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  notebooks: Notebook[];
  path: Path;
  onNotebookClick: (notebook: Notebook) => void;
  onNewNotebook: (notebookTitle: string) => void;
  onDeleteNotebook: (path: NotebookPath) => void;
  onChangeNotebookTitle: (path: NotebookPath, newTitle: string) => void;
}

export default function NotebooksColumn(props: Props) {
  const {
    notebooks,
    path,
    onNotebookClick,
    onNewNotebook,
    onDeleteNotebook,
    onChangeNotebookTitle,
  } = props;

  return (
    <Column
      addButtonText='+ Notizbuch'
      onAddClick={() => onNewNotebook('Neues Notizbuch')}
    >
      {notebooks.map(n => (
        <Element
          key={n.title}
          className={n.title === path.notebookTitle ? 'active' : ''}
          label={n.title}
          indexTabColor={n.color}
          onClick={() => onNotebookClick(n)}
          onDeleteClick={() => onDeleteNotebook({ notebookTitle: n.title })}
          onTitleChange={newTitle =>
            onChangeNotebookTitle({ notebookTitle: n.title }, newTitle)
          }
        />
      ))}
    </Column>
  );
}
