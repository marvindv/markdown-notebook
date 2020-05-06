import React from 'react';
import Button from 'components/Button';
import {
  findNotebook,
  findNotebookIndex,
  findPage,
  findPageIndex,
  findSection,
  findSectionIndex,
} from 'features/notebooks/selection';
import Notebook from 'models/notebook';
import Path, { PagePath } from 'models/path';
import Api, { DuplicateError, InvalidPathError, NotFoundError } from './api';

enum LocalStorageVersion {
  v1 = '1',
}

interface LocalStorage {
  version: LocalStorageVersion;
  notebooks: Notebook[];
}

/**
 * Api to store notebooks in the browsers localStorage.
 *
 * @export
 * @class LocalStorageApi
 * @extends {Api}
 */
export default class LocalStorageApi extends Api {
  private readonly key = '_markdown_notebook_storage';

  getLoginButtonText() {
    return (
      <div>
        <div>In diesem Browser</div>
        <small>ohne Synchronisation</small>
      </div>
    );
  }

  getLoginUi() {
    return (props: { onDone: () => void }) => {
      return (
        <div>
          <div>
            <strong>Achtung!</strong> Sobald Cookies und Browserdaten gelöscht
            werden, gehen auch alle gespeicherten Notizen verloren.
          </div>

          <Button
            themeColor='primary'
            type='button'
            onClick={props.onDone}
            style={{ marginTop: '1rem' }}
          >
            Verstanden
          </Button>
        </div>
      );
    };
  }

  /**
   * @inheritdoc
   *
   * @returns {boolean}
   * @memberof LocalStorageApi
   */
  isValid(): boolean {
    return true;
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  logout() {
    // TODO: Add a logout UI to let the user choose to whether or not to remove
    // all data.
    //localStorage.removeItem(this.key);
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async fetchNotebooks(): Promise<Notebook[]> {
    const { notebooks } = this.getLocalStorage();
    return notebooks;
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async addEntity(path: Path): Promise<{ actualPath: Path }> {
    const storage = this.getLocalStorage();
    // Add a page.
    if (path.pageTitle) {
      let { notebookTitle, sectionTitle, pageTitle } = path;
      pageTitle = pageTitle.trim();

      const { section } = findSection(path, storage.notebooks) || {};
      if (!section) {
        throw new NotFoundError('Parent section not found.');
      }

      if (section.pages.find(p => p.title === pageTitle)) {
        throw new DuplicateError('There is already a page with that title.');
      }

      section.pages.push({ content: '', title: pageTitle });
      this.setLocalStorage(storage);
      return {
        actualPath: { notebookTitle, sectionTitle, pageTitle },
      };
    }

    // Add a section.
    if (path.sectionTitle) {
      let { notebookTitle, sectionTitle } = path;
      sectionTitle = sectionTitle.trim();

      const notebook = findNotebook(path, storage.notebooks);
      if (!notebook) {
        throw new NotFoundError('Parent notebook not found.');
      }

      if (notebook.sections.find(s => s.title === sectionTitle)) {
        throw new DuplicateError('There is already a section with that title.');
      }

      notebook.sections.push({ title: sectionTitle, pages: [] });
      this.setLocalStorage(storage);
      return { actualPath: { notebookTitle, sectionTitle } };
    }

    // Add a notebook.
    if (path.notebookTitle) {
      let { notebookTitle } = path;
      notebookTitle = notebookTitle.trim();

      if (storage.notebooks.find(n => n.title === notebookTitle)) {
        throw new DuplicateError(
          'There is already a notebook with that title.'
        );
      }

      storage.notebooks.push({
        title: notebookTitle,
        sections: [],
      });
      this.setLocalStorage(storage);
      return { actualPath: { notebookTitle } };
    }

    throw new InvalidPathError();
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async changeEntityTitle(
    path: Path,
    newTitle: string
  ): Promise<{ oldPath: Path; newTitle: string }> {
    newTitle = newTitle.trim();
    const storage = this.getLocalStorage();
    const { notebooks } = storage;

    if (path.pageTitle) {
      const { page } = findPage(path, notebooks) || {};
      if (!page) {
        throw new NotFoundError();
      }

      page.title = newTitle;
    } else if (path.sectionTitle) {
      const { section } = findSection(path, notebooks) || {};
      if (!section) {
        throw new NotFoundError();
      }

      section.title = newTitle;
    } else if (path.notebookTitle) {
      const notebook = findNotebook(path, notebooks);
      if (!notebook) {
        throw new NotFoundError();
      }

      notebook.title = newTitle;
    } else {
      throw new InvalidPathError();
    }

    this.setLocalStorage(storage);
    return { oldPath: path, newTitle };
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async deleteEntity(path: Path): Promise<{ path: Path }> {
    const storage = this.getLocalStorage();
    const { notebooks } = storage;

    if (path.pageTitle) {
      const { pageIndex, section } = findPageIndex(path, notebooks) || {};
      if (pageIndex === undefined || !section) {
        throw new NotFoundError();
      }

      section.pages.splice(pageIndex, 1);
    } else if (path.sectionTitle) {
      const { sectionIndex, notebook } =
        findSectionIndex(path, notebooks) || {};
      if (sectionIndex === undefined || !notebook) {
        throw new NotFoundError();
      }

      notebook.sections.splice(sectionIndex, 1);
    } else if (path.notebookTitle) {
      const notebookIndex = findNotebookIndex(path, notebooks);
      if (notebookIndex === undefined) {
        throw new NotFoundError();
      }

      notebooks.splice(notebookIndex, 1);
    } else {
      throw new InvalidPathError();
    }

    this.setLocalStorage(storage);
    return { path };
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async setPageContent(path: PagePath, content: string): Promise<void> {
    const storage = this.getLocalStorage();
    const { page } = findPage(path, storage.notebooks) || {};
    if (!page) {
      throw new NotFoundError();
    }

    page.content = content;
    this.setLocalStorage(storage);
  }

  private getLocalStorage(): LocalStorage {
    const value = localStorage.getItem(this.key);
    let storage: LocalStorage;
    if (value === null) {
      storage = this.setDefaultStorage();
    } else {
      try {
        storage = JSON.parse(value);
      } catch {
        storage = this.setDefaultStorage();
      }
    }

    return storage;
  }

  private setLocalStorage(data: LocalStorage) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  private setDefaultStorage(): LocalStorage {
    const storage = {
      version: LocalStorageVersion.v1,
      notebooks: [],
    };
    this.setLocalStorage(storage);
    return storage;
  }
}
