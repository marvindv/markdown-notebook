import Notebook from 'models/notebook';
import Path, { PagePath } from 'models/path';

/**
 * The interface each api must implement.
 *
 * @export
 * @abstract
 * @class Api
 */
export default abstract class Api {
  /**
   * Loads all notebooks.
   *
   * @abstract
   * @returns {Promise<Notebook[]>}
   * @memberof Api
   */
  abstract async fetchNotebooks(): Promise<Notebook[]>;

  /**
   * Adds a new notebook, section or page.
   *
   * @abstract
   * @param {Path} path
   * @returns {Promise<{ actualPath: Path }>}
   * @memberof Api
   */
  abstract async addEntity(path: Path): Promise<{ actualPath: Path }>;

  /**
   * Changes the title of a notebook, section or page.
   *
   * @abstract
   * @param {Path} path
   * @param {string} newTitle
   * @returns {Promise<{ oldPath: Path; newTitle: string }>}
   * @memberof Api
   */
  abstract async changeEntityTitle(
    path: Path,
    newTitle: string
  ): Promise<{ oldPath: Path; newTitle: string }>;

  /**
   * Deletes a notebook, section or page.
   *
   * @abstract
   * @param {Path} path
   * @returns {Promise<{ path: Path }>}
   * @memberof Api
   */
  abstract async deleteEntity(path: Path): Promise<{ path: Path }>;

  /**
   * Sets the content of the page specified by the given path.
   *
   * @abstract
   * @param {PagePath} path
   * @param {string} content
   * @returns {Promise<void>}
   * @memberof Api
   */
  abstract async setPageContent(path: PagePath, content: string): Promise<void>;
}
