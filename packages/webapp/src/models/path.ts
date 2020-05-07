export interface BasePath {
  notebookTitle?: string | undefined;
  sectionTitle?: string | undefined;
  pageTitle?: string | undefined;
}

/**
 * A path to nothing.
 *
 * @export
 * @interface EmptyPath
 * @extends {BasePath}
 */
export interface EmptyPath extends BasePath {
  notebookTitle?: undefined;
  sectionTitle?: undefined;
  pageTitle?: undefined;
}

/**
 * A path to a notebook.
 *
 * @export
 * @interface NotebookPath
 * @extends {BasePath}
 */
export interface NotebookPath extends BasePath {
  notebookTitle: string;
  sectionTitle?: undefined;
  pageTitle?: undefined;
}

/**
 * A path to a section inside a notebook.
 *
 * @export
 * @interface SectionPath
 * @extends {BasePath}
 */
export interface SectionPath extends BasePath {
  notebookTitle: string;
  sectionTitle: string;
  pageTitle?: undefined;
}

/**
 * A path to a page inside a section of a notebook.
 *
 * @export
 * @interface PagePath
 * @extends {BasePath}
 */
export interface PagePath extends BasePath {
  notebookTitle: string;
  sectionTitle: string;
  pageTitle: string;
}

export type Path = EmptyPath | NotebookPath | SectionPath | PagePath;

export default Path;
