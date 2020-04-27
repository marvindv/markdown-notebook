import { findSection } from 'features/notebooks/selection';
import Notebook, { Page } from 'models/notebook';
import { PagePath, SectionPath } from 'models/path';
import React from 'react';
import Column from './Column';
import Element from './Element';

export interface Props {
  path: SectionPath | PagePath;
  notebooks: Notebook[];
  onPageClick: (page: Page) => void;
  onNewPage: (path: SectionPath, newTitle: string) => void;
  onDeletePage: (path: PagePath) => void;
  onChangePageTitle: (path: PagePath, newTitle: string) => void;
  titleEditingPages: { [pageTitle: string]: true } | undefined;
  onChangePageTitleEditing: (path: PagePath, isEditing: boolean) => void;
}

export default function PageColumn(props: Props) {
  const {
    path,
    notebooks,
    onPageClick,
    onNewPage,
    onDeletePage,
    onChangePageTitle,
    titleEditingPages,
    onChangePageTitleEditing,
  } = props;
  const { section } = findSection(path, notebooks) || {};

  return (
    <Column
      addButtonText='+ Seite'
      onAddClick={() =>
        onNewPage({ ...path, pageTitle: undefined }, 'Neue Seite')
      }
    >
      {section?.pages.map(page => (
        <Element
          key={page.title}
          className={page.title === path.pageTitle ? 'active' : ''}
          label={page.title}
          onClick={() => onPageClick(page)}
          onDeleteClick={() => onDeletePage({ ...path, pageTitle: page.title })}
          onTitleChange={newTitle =>
            onChangePageTitle({ ...path, pageTitle: page.title }, newTitle)
          }
          isEditing={!!titleEditingPages?.[page.title]}
          onEditingChange={isEditing =>
            onChangePageTitleEditing(
              { ...path, pageTitle: page.title },
              isEditing
            )
          }
        />
      ))}
    </Column>
  );
}
