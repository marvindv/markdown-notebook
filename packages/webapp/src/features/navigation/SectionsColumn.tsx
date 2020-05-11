import React from 'react';
import { PagesWithUnsavedChangesTree } from 'src/features/notebooks/notebooksSlice';
import { findNotebook } from 'src/features/notebooks/selection';
import Notebook, { Section } from 'src/models/notebook';
import { NotebookPath, SectionPath } from 'src/models/path';
import Column from './Column';
import Element from './Element';
import EmptyElement from './EmptyElement';

function SectionElement(props: Props & { section: Section }) {
  const {
    path,
    section,
    unsavedPages,
    onSectionClick,
    onDeleteSection,
    onChangeSectionTitle,
    titleEditingSections,
    onChangeSectionTitleEditing,
  } = props;
  const hasUnsavedChanges = !!unsavedPages[path.notebookTitle]?.[section.title];

  return (
    <Element
      className={section.title === path?.sectionTitle ? 'active' : ''}
      label={section.title}
      showUnsavedChangesIndicator={hasUnsavedChanges}
      unsavedChangesIndicatorTooltip='Dieser Abschnitt enthält ungespeicherte Änderungen.'
      onClick={() => onSectionClick(section)}
      onDeleteClick={() =>
        onDeleteSection({ ...path, sectionTitle: section.title })
      }
      onTitleChange={newTitle =>
        onChangeSectionTitle({ ...path, sectionTitle: section.title }, newTitle)
      }
      isEditing={!!titleEditingSections?.[section.title]}
      onEditingChange={isEditing =>
        onChangeSectionTitleEditing(
          { ...path, sectionTitle: section.title },
          isEditing
        )
      }
      saveButtonDisabled={!hasUnsavedChanges}
      onSaveClick={() =>
        props.onSaveClick({ ...path, sectionTitle: section.title })
      }
    />
  );
}

export interface Props {
  path: NotebookPath | SectionPath;
  notebooks: Notebook[];
  unsavedPages: PagesWithUnsavedChangesTree;
  onSectionClick: (section: Section) => void;
  onNewSection: (path: NotebookPath, newTitle: string) => void;
  onDeleteSection: (path: SectionPath) => void;
  onChangeSectionTitle: (path: SectionPath, newTitle: string) => void;
  titleEditingSections: { [sectionTitle: string]: true } | undefined;
  onChangeSectionTitleEditing: (path: SectionPath, isEditing: boolean) => void;
  onSaveClick: (path: SectionPath) => void;
}

/**
 * The navigation column that renders all sections of the currently selected
 * notebook.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function SectionsColumn(props: Props) {
  const { path, notebooks, onNewSection } = props;
  const notebook = findNotebook(path, notebooks);

  let elements = notebook?.sections?.length ? (
    notebook.sections.map(section => (
      <SectionElement key={section.title} {...props} section={section} />
    ))
  ) : (
    <EmptyElement>Dieses Notizbuch ist leer.</EmptyElement>
  );

  return (
    <Column
      addButtonText='+ Abschnitt'
      onAddClick={() => {
        onNewSection({ notebookTitle: path.notebookTitle }, 'Neuer Abschnitt');
      }}
    >
      {elements}
    </Column>
  );
}
