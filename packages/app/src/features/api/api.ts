import React from 'react';
import Notebook from 'src/models/notebook';
import Path, { PagePath } from 'src/models/path';

/**
 * The interface each api must implement.
 *
 * @export
 * @abstract
 * @class Api
 */
export default abstract class Api {
  /**
   * Returns the content of the button in the ui where the user can choose the
   * api implementation to store their notes with. The content should offer a
   * short description on where the notes are saved.
   *
   * @abstract
   * @returns {React.ReactNode}
   * @memberof Api
   */
  abstract getLoginButtonText(): React.ReactNode;

  /**
   * Gets the component that will be rendered when the user selects this api in
   * the api selection ui. This component can then be used to let the user
   * authenticate or show implications to keep in mind when using this api.
   *
   * As soon as the api is fully initialized and all necessary user input is
   * done, the returned component will call the `onDone` callback function
   * provided in the props.
   *
   * @abstract
   * @returns {React.ComponentType<{
   *     onDone: () => void;
   *   }>}
   * @memberof Api
   */
  abstract getLoginUi(): React.ComponentType<{
    onDone: () => void;
  }>;

  /**
   * Gets the value indicating whether this api is ready for use.
   *
   * @abstract
   * @returns {boolean}
   * @memberof Api
   */
  abstract isValid(): boolean;

  /**
   * Logs the user out from this api. Should transform the api instance to its
   * initial state.
   *
   * @abstract
   * @memberof Api
   */
  abstract logout(): void;

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

/**
 * Base class for api errors.
 *
 * See http://stackoverflow.com/a/32749533
 *
 * @export
 * @class ApiError
 * @extends {Error}
 */
export class ApiError extends Error {
  constructor(message: string = '') {
    super(message);
    (Object as any).setPrototypeOf(this, ApiError.prototype);

    this.message = message;
    this.name = this.constructor.name;
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor as any);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class DuplicateError extends ApiError {
  constructor(message?: string) {
    super(message);
    (Object as any).setPrototypeOf(this, DuplicateError.prototype);
    this.name = this.constructor.name;
  }
}

export class InvalidPathError extends ApiError {
  constructor(message?: string) {
    super(message);
    (Object as any).setPrototypeOf(this, InvalidPathError.prototype);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  constructor(message?: string) {
    super(message);
    (Object as any).setPrototypeOf(this, NotFoundError.prototype);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor(message?: string) {
    super(message);
    (Object as any).setPrototypeOf(this, InvalidCredentialsError.prototype);
    this.name = this.constructor.name;
  }
}

export class ConnectionError extends ApiError {
  constructor(message?: string) {
    super(message);
    (Object as any).setPrototypeOf(this, ConnectionError.prototype);
    this.name = this.constructor.name;
  }
}
