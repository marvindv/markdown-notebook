/**
 * A 3-tuple representing a RGB color.
 */
export type RgbColor = [number, number, number];

/**
 * Describes a page of a notebook section.
 *
 * @export
 * @interface Page
 */
export interface Page {
  /**
   * The title of this page. Is unique in a notebook section. The title is not
   * part of the content.
   *
   * @type {string}
   * @memberof Page
   */
  title: string;

  /**
   * The markdown content of this page.
   *
   * @type {string}
   * @memberof Page
   */
  content: string;
}

/**
 * Describes a section of a notebook.
 *
 * @export
 * @interface Section
 */
export interface Section {
  /**
   * The title of this section. Is unique in a notebook.
   *
   * @type {string}
   * @memberof Section
   */
  title: string;

  /**
   * The pages in this section.
   *
   * @type {Page[]}
   * @memberof Section
   */
  pages: Page[];
}

export default interface Notebook {
  /**
   * The title of this notebook.
   *
   * @type {string}
   * @memberof Notebook
   */
  title: string;

  /**
   * The sections this notebook contains.
   *
   * @type {Section[]}
   * @memberof Notebook
   */
  sections: Section[];
}
