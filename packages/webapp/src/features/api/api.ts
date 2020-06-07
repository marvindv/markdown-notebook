import React from 'react';
import { Node, NodeName, Path } from 'src/models/node';

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
   * Loads all root nodes. Each then contains their child nodes.
   *
   * @abstract
   * @returns {Promise<Node[]>}
   * @memberof Api
   */
  abstract async fetchNodes(): Promise<Node[]>;

  /**
   * Creates a new node. While for a {@link FileNode} the content can be
   * specified, children of a given {@link DirectoryNode} will be ignored and
   * an empty directory node will be created.
   *
   * @abstract
   * @template T
   * @param {Path} parent
   * @param {T} node
   * @returns {Promise<{ parent: Path; node: T }>}
   * @memberof Api
   */
  abstract async addNode<T extends Node>(
    parent: Path,
    node: T
  ): Promise<{ parent: Path; node: T }>;

  /**
   * Changes the name of a node.
   *
   * @abstract
   * @param {Path} path
   * @param {NodeName} newName
   * @returns {Promise<{ oldPath: Path; newName: NodeName }>}
   * @memberof Api
   */
  abstract async changeNodeName(
    path: Path,
    newName: NodeName
  ): Promise<{ oldPath: Path; newName: NodeName }>;

  /**
   * Deletes a node and all its children if there are any.
   *
   * @abstract
   * @param {Path} path
   * @returns {Promise<{ path: Path }>}
   * @memberof Api
   */
  abstract async deleteNode(path: Path): Promise<{ path: Path }>;

  /**
   * Sets the content of the page specified by the given path.
   *
   * @abstract
   * @param {Path} path
   * @param {string} content
   * @returns {Promise<void>}
   * @memberof Api
   */
  abstract async setPageContent(path: Path, content: string): Promise<void>;

  /**
   * Moves the node specified by `nodePath` to a new parent specified by
   * `newParentPath`.
   *
   * @abstract
   * @param {Path} nodePath
   * @param {Path} newParentPath
   * @returns {Promise<{ oldPath: Path, newPath: Path }>}
   * @memberof Api
   */
  abstract async moveNode(
    nodePath: Path,
    newParentPath: Path
  ): Promise<{ oldPath: Path; newPath: Path }>;
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
