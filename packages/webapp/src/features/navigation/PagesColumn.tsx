import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { PagesWithUnsavedChangesTree } from 'src/features/notebooks/notebooksSlice';
import { findSection } from 'src/features/notebooks/selection';
import Notebook, { Page } from 'src/models/notebook';
import { PagePath, SectionPath } from 'src/models/path';
import Column from './Column';
import Element from './Element';
import EmptyElement from './EmptyElement';

export interface Props {
  path: SectionPath | PagePath;
  notebooks: Notebook[];
  unsavedPages: PagesWithUnsavedChangesTree;
  onPageClick: (page: Page) => void;
  onNewPage: (path: SectionPath, newTitle: string) => void;
  onDeletePage: (path: PagePath) => void;
  onChangePageTitle: (path: PagePath, newTitle: string) => void;
  titleEditingPages: { [pageTitle: string]: true } | undefined;
  onChangePageTitleEditing: (path: PagePath, isEditing: boolean) => void;
  onSaveClick: (path: PagePath) => void;
}

function PageElement(props: Props & { page: Page }) {
  const {
    path,
    unsavedPages,
    onPageClick,
    onDeletePage,
    onChangePageTitle,
    titleEditingPages,
    onChangePageTitleEditing,
    page,
  } = props;

  const hasUnsavedChanges = !!unsavedPages[path.notebookTitle]?.[
    path.sectionTitle
  ]?.[page.title];

  return (
    <Element
      className={page.title === path.pageTitle ? 'active' : ''}
      label={page.title}
      showUnsavedChangesIndicator={hasUnsavedChanges}
      unsavedChangesIndicatorTooltip='Diese Seite enthält ungespeicherte Änderungen.'
      onClick={() => onPageClick(page)}
      onDeleteClick={() => onDeletePage({ ...path, pageTitle: page.title })}
      onTitleChange={newTitle =>
        onChangePageTitle({ ...path, pageTitle: page.title }, newTitle)
      }
      isEditing={!!titleEditingPages?.[page.title]}
      onEditingChange={isEditing =>
        onChangePageTitleEditing({ ...path, pageTitle: page.title }, isEditing)
      }
      saveButtonDisabled={!hasUnsavedChanges}
      onSaveClick={() => props.onSaveClick({ ...path, pageTitle: page.title })}
    />
  );
}

/**
 * The navigation column that renders all pages of the currently selected
 * section.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function PageColumn(props: Props) {
  const { path, notebooks, onNewPage } = props;
  const { section } = findSection(path, notebooks) || {};

  let elements = section?.pages?.length ? (
    section.pages.map(page => (
      <PageElement key={page.title} {...props} page={page} />
    ))
  ) : (
    <EmptyElement>Dieser Abschnitt ist leer.</EmptyElement>
  );

  return (
    <Column
      addButtonText={
        <>
          <FontAwesomeIcon icon={faPlusCircle} /> Seite
        </>
      }
      onAddClick={() =>
        onNewPage({ ...path, pageTitle: undefined }, 'Neue Seite')
      }
    >
      {elements}
    </Column>
  );
}
