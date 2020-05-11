import React from 'react';
import { PagesWithUnsavedChangesTree } from 'src/features/notebooks/notebooksSlice';
import Notebook from 'src/models/notebook';
import Path, { NotebookPath } from 'src/models/path';
import Column from './Column';
import Element from './Element';
import EmptyElement from './EmptyElement';

export interface Props {
  notebooks: Notebook[];
  path: Path;
  unsavedPages: PagesWithUnsavedChangesTree;
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

function NotebookElement(props: Props & { notebook: Notebook }) {
  const {
    notebook,
    path,
    unsavedPages,
    onNotebookClick,
    onDeleteNotebook,
    onChangeNotebookTitle,
    titleEditingNotebooks,
    onChangeNotebookTitleEditing,
  } = props;
  const n = notebook;
  return (
    <Element
      className={n.title === path.notebookTitle ? 'active' : ''}
      label={n.title}
      showUnsavedChangesIndicator={!!unsavedPages[n.title]}
      unsavedChangesIndicatorTooltip='In diesem Notizbuch befinden sich ungespeicherte Änderungen.'
      onClick={() => onNotebookClick(n)}
      onDeleteClick={() => onDeleteNotebook({ notebookTitle: n.title })}
      onTitleChange={newTitle =>
        onChangeNotebookTitle({ notebookTitle: n.title }, newTitle)
      }
      isEditing={!!titleEditingNotebooks?.[n.title]}
      onEditingChange={isEditing =>
        onChangeNotebookTitleEditing({ notebookTitle: n.title }, isEditing)
      }
    />
  );
}

/**
 * The navigation column that renders a list of all notebooks the user has
 * created.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function NotebooksColumn(props: Props) {
  const { notebooks, onNewNotebook } = props;

  return (
    <Column
      addButtonText='+ Notizbuch'
      onAddClick={() => onNewNotebook('Neues Notizbuch')}
    >
      {notebooks.length ? (
        notebooks.map(n => (
          <NotebookElement key={n.title} {...props} notebook={n} />
        ))
      ) : (
        <EmptyElement>Du hast noch keine Notizbücher erstellt.</EmptyElement>
      )}
    </Column>
  );
}
