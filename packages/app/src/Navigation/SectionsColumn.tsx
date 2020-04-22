import Notebook, { Section } from 'features/notebooks/model';
import { findNotebook } from 'features/notebooks/selection';
import { NotebookPath, SectionPath } from 'features/path/model';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  path: NotebookPath;
  notebooks: Notebook[];
  onSectionClick: (section: Section) => void;
  onNewSection: (path: NotebookPath, newTitle: string) => void;
  onDeleteSection: (path: SectionPath) => void;
  onChangeSectionTitle: (path: SectionPath, newTitle: string) => void;
}

export default function SectionsColumn(props: Props) {
  const {
    path,
    notebooks,
    onSectionClick,
    onNewSection,
    onDeleteSection,
    onChangeSectionTitle,
  } = props;
  const notebook = findNotebook(path, notebooks);

  return (
    <Column
      addButtonText='+ Abschnitt'
      onAddClick={() => onNewSection(path, 'Neuer Abschnitt')}
    >
      {notebook?.sections.map(section => (
        <Element
          key={section.title}
          className={section.title === path?.sectionTitle ? 'active' : ''}
          label={section.title}
          indexTabColor={section.color}
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
        />
      ))}
    </Column>
  );
}
