import { PagePath } from 'features/path/model';
import Notebook, { Page, Section } from './model';

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
  if (!notebook) {
    return undefined;
  }

  const section = notebook.sections.find(s => s.title === path.sectionTitle);
  if (!section) {
    return undefined;
  }

  const page = section.pages.find(p => p.title === path.pageTitle);
  if (!page) {
    return undefined;
  }

  return {
    notebook,
    section,
    page,
  };
}
