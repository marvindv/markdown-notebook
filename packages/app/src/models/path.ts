export interface BasePath {
  notebookTitle?: string | undefined;
  sectionTitle?: string | undefined;
  pageTitle?: string | undefined;
}

export interface EmptyPath extends BasePath {
  notebookTitle?: undefined;
  sectionTitle?: undefined;
  pageTitle?: undefined;
}

export interface NotebookPath extends BasePath {
  notebookTitle: string;
  sectionTitle?: undefined;
  pageTitle?: undefined;
}

export interface SectionPath extends BasePath {
  notebookTitle: string;
  sectionTitle: string;
  pageTitle?: undefined;
}

export interface PagePath extends BasePath {
  notebookTitle: string;
  sectionTitle: string;
  pageTitle: string;
}

export type Path = EmptyPath | NotebookPath | SectionPath | PagePath;

export default Path;
