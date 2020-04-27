import { findNotebook } from 'features/notebooks/selection';
import Notebook, { Section } from 'models/notebook';
import { NotebookPath, SectionPath } from 'models/path';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  path: NotebookPath | SectionPath;
  notebooks: Notebook[];
  onSectionClick: (section: Section) => void;
  onNewSection: (path: NotebookPath, newTitle: string) => void;
  onDeleteSection: (path: SectionPath) => void;
  onChangeSectionTitle: (path: SectionPath, newTitle: string) => void;
  titleEditingSections: { [sectionTitle: string]: true } | undefined;
  onChangeSectionTitleEditing: (path: SectionPath, isEditing: boolean) => void;
}

export default function SectionsColumn(props: Props) {
  const {
    path,
    notebooks,
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
        console.warn(path);
        onNewSection({ notebookTitle: path.notebookTitle }, 'Neuer Abschnitt');
      }}
    >
      {notebook?.sections.map(section => (
        <Element
          key={section.title}
          className={section.title === path?.sectionTitle ? 'active' : ''}
          label={section.title}
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
        />
      ))}
    </Column>
  );
}
