import Notebook, { Section } from 'features/notebooks/model';
import { findNotebook } from 'features/notebooks/selection';
import { NotebookPath } from 'features/path/model';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  path: NotebookPath;
  notebooks: Notebook[];
  onSectionClick: (section: Section) => void;
}

export default function SectionsColumn(props: Props) {
  const { path, notebooks, onSectionClick } = props;
  const notebook = findNotebook(path, notebooks);

  return (
    <Column addButtonText='+ Abschnitt' onAddClick={() => {}}>
      {notebook?.sections.map(section => (
        <Element
          key={section.title}
          className={section.title === path?.sectionTitle ? 'active' : ''}
          label={section.title}
          indexTabColor={section.color}
          onClick={() => onSectionClick(section)}
        />
      ))}
    </Column>
  );
}
