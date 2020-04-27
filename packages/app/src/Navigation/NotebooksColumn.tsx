import Notebook from 'models/notebook';
import Path, { NotebookPath } from 'models/path';
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
  titleEditingNotebooks: { [notebookTitle: string]: true } | undefined;
  onChangeNotebookTitleEditing: (
    path: NotebookPath,
    isEditing: boolean
  ) => void;
}

export default function NotebooksColumn(props: Props) {
  const {
    notebooks,
    path,
    onNotebookClick,
    onNewNotebook,
    onDeleteNotebook,
    onChangeNotebookTitle,
    titleEditingNotebooks,
    onChangeNotebookTitleEditing,
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
          onClick={() => onNotebookClick(n)}
          onDeleteClick={() => onDeleteNotebook({ notebookTitle: n.title })}
          onTitleChange={newTitle =>
            onChangeNotebookTitle({ notebookTitle: n.title }, newTitle)
          }
          isEditing={!!titleEditingNotebooks?.[n.title]}
          onEditingChange={isEditing =>
            onChangeNotebookTitleEditing(path as NotebookPath, isEditing)
          }
        />
      ))}
    </Column>
  );
}
