import { PagePath, SectionPath, NotebookPath } from 'models/path';
import Notebook, { Page, Section } from 'models/notebook';

/**
 * Find the page and the enclosing section and notebook described by the given
 * path from a list of notebooks.
 *
 * @export
 * @param {PagePath} path
 * @param {Notebook[]} notebooks
 * @returns {({ notebook: Notebook; section: Section; page: Page } | undefined)}
 */
export function findPage(
  path: PagePath,
  notebooks: Notebook[]
): { notebook: Notebook; section: Section; page: Page } | undefined {
  const notebook = notebooks.find(n => n.title === path.notebookTitle);
  const section = notebook?.sections.find(s => s.title === path.sectionTitle);
  const page = section?.pages.find(p => p.title === path.pageTitle);
  if (notebook && section && page) {
    return {
      notebook,
      section,
      page,
    };
  }

  return undefined;
}

/**
 * Find the page index and the enclosing section and notebook described by the
 * given path from a list of notebooks.
 *
 * @export
 * @param {PagePath} path
 * @param {Notebook[]} notebooks
 * @returns {({
 *       notebook: Notebook;
 *       section: Section;
 *       pageIndex: number;
 *     }
 *   | undefined)}
 */
export function findPageIndex(
  path: PagePath,
  notebooks: Notebook[]
):
  | {
      notebook: Notebook;
      section: Section;
      pageIndex: number;
    }
  | undefined {
  const notebook = notebooks.find(n => n.title === path.notebookTitle);
  const section = notebook?.sections.find(s => s.title === path.sectionTitle);
  const pageIndex = section?.pages.findIndex(p => p.title === path.pageTitle);
  if (notebook && section && pageIndex !== -1 && pageIndex !== undefined) {
    return { notebook, section, pageIndex };
  }

  return undefined;
}

/**
 * Finds the section and the enclosing notebooks described by the given path
 * from a list of notebooks.
 *
 * @export
 * @param {(PagePath | SectionPath)} path
 * @param {Notebook[]} notebooks
 * @returns {({ notebook: Notebook; section: Section } | undefined)}
 */
export function findSection(
  path: PagePath | SectionPath,
  notebooks: Notebook[]
): { notebook: Notebook; section: Section } | undefined {
  const notebook = notebooks.find(n => n.title === path.notebookTitle);
  const section = notebook?.sections.find(s => s.title === path.sectionTitle);
  // The notebook check is actually not necessary but otherwise typescript
  // complains.
  if (notebook && section) {
    return { notebook, section };
  }

  return undefined;
}

/**
 * Finds the section index and the enclosing notebook described by the given
 * path from a list of notebooks.
 *
 * @export
 * @param {(PagePath | SectionPath)} path
 * @param {Notebook[]} notebooks
 * @returns {({ notebook: Notebook; sectionIndex: number } | undefined)}
 */
export function findSectionIndex(
  path: PagePath | SectionPath,
  notebooks: Notebook[]
): { notebook: Notebook; sectionIndex: number } | undefined {
  const notebook = notebooks.find(n => n.title === path.notebookTitle);
  const sectionIndex = notebook?.sections.findIndex(
    s => s.title === path.sectionTitle
  );
  if (notebook && sectionIndex !== -1 && sectionIndex !== undefined) {
    return { notebook, sectionIndex };
  }

  return undefined;
}

/**
 * Finds the notebook described by the given path from a list of notebooks.
 *
 * @export
 * @param {(NotebookPath | SectionPath | PagePath)} path
 * @param {Notebook[]} notebooks
 * @returns {(Notebook | undefined)}
 */
export function findNotebook(
  path: NotebookPath | SectionPath | PagePath,
  notebooks: Notebook[]
): Notebook | undefined {
  return notebooks.find(n => n.title === path.notebookTitle);
}

/**
 * Finds the notebook index described by the given path from a list of
 * notebooks. Returns `undefined` if no notebook matches the path.
 *
 * @export
 * @param {(NotebookPath | SectionPath | PagePath)} path
 * @param {Notebook[]} notebooks
 * @returns {(number | undefined)}
 */
export function findNotebookIndex(
  path: NotebookPath | SectionPath | PagePath,
  notebooks: Notebook[]
): number | undefined {
  const index = notebooks.findIndex(n => n.title === path.notebookTitle);
  if (index === -1) {
    return undefined;
  }

  return index;
}
