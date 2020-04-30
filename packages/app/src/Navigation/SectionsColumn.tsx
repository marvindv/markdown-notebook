import React from 'react';
import { PagesWithUnsavedChangesTree } from 'features/notebooks/notebooksSlice';
import { findNotebook } from 'features/notebooks/selection';
import Notebook, { Section } from 'models/notebook';
import { NotebookPath, SectionPath } from 'models/path';
import Column from './Column';
import Element from './Element';

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

export default function SectionsColumn(props: Props) {
  const {
    path,
    notebooks,
    unsavedPages,
    onSectionClick,
    onNewSection,
    onDeleteSection,
    onChangeSectionTitle,
    titleEditingSections,
    onChangeSectionTitleEditing,
  } = props;
  const notebook = findNotebook(path, notebooks);

  return (
    <Column
      addButtonText='+ Abschnitt'
      onAddClick={() => {
        onNewSection({ notebookTitle: path.notebookTitle }, 'Neuer Abschnitt');
      }}
    >
      {notebook?.sections.map(section => {
        const hasUnsavedChanges = !!unsavedPages[path.notebookTitle]?.[
          section.title
        ];

        return (
          <Element
            key={section.title}
            className={section.title === path?.sectionTitle ? 'active' : ''}
            label={section.title}
            showUnsavedChangesIndicator={hasUnsavedChanges}
            unsavedChangesIndicatorTooltip='Dieser Abschnitt enthält ungespeicherte Änderungen.'
            onClick={() => onSectionClick(section)}
            onDeleteClick={() =>
              onDeleteSection({ ...path, sectionTitle: section.title })
            }
            onTitleChange={newTitle =>
              onChangeSectionTitle(
                { ...path, sectionTitle: section.title },
                newTitle
              )
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
      })}
    </Column>
  );
}
