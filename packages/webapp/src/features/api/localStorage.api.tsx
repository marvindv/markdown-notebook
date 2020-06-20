import React from 'react';
import Button from 'src/components/Button';
import { DirectoryNode, Node, Path } from 'src/models/node';
import Api, { DuplicateError, InvalidPathError, NotFoundError } from './api';

enum LocalStorageVersion {
  v1 = '1',
}

interface LocalStorage {
  version: LocalStorageVersion;
  root: DirectoryNode;
}

/**
 * Api to store notes in the browsers localStorage.
 *
 * @export
 * @class LocalStorageApi
 * @extends {Api}
 */
export default class LocalStorageApi extends Api {
  fetchNodes(): Promise<Node[]> {
    const { root } = this.getLocalStorage();
    const nodes: Node[] = [];
    for (const rootNodeName of Object.keys(root.children)) {
      nodes.push(root.children[rootNodeName]);
    }

    return Promise.resolve(nodes);
  }

  addNode<T extends Node>(
    parent: Path,
    node: T
  ): Promise<{ parent: Path; node: T }> {
    const { root, version } = this.getLocalStorage();

    // Find the parent node.
    let parentNode: Node = root;
    for (const part of parent) {
      if (!parentNode.isDirectory) {
        // A part of the parent path is a file, which is invalid.
        throw new NotFoundError();
      }

      parentNode = parentNode.children[part];
    }

    if (!parentNode || !parentNode.isDirectory) {
      throw new NotFoundError();
    }

    parentNode.children[node.name] = node;
    this.setLocalStorage({ root, version });
    return Promise.resolve({ parent, node });
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async setPageContent(path: Path, content: string): Promise<void> {
    const storage = this.getLocalStorage();

    let node: Node | undefined = storage.root;
    for (const part of path) {
      node = node?.children?.[part];
    }

    if (!node) {
      throw new NotFoundError();
    }

    if (node.isDirectory) {
      throw new InvalidPathError();
    }

    node.content = content;

    this.setLocalStorage(storage);
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  changeNodeName(
    path: Path,
    newName: string
  ): Promise<{ oldPath: Path; newName: string }> {
    const { root, version } = this.getLocalStorage();
    const parentPath = path.slice(0, -1);
    let parent: Node | undefined = root;
    for (const part of parentPath) {
      parent = parent?.children?.[part];
    }

    const oldName = path[path.length - 1];
    if (
      !parent ||
      !parent.isDirectory ||
      !parent.children.hasOwnProperty(oldName)
    ) {
      throw new NotFoundError();
    }

    if (parent.children.hasOwnProperty(newName)) {
      throw new DuplicateError();
    }

    parent.children[newName] = parent.children[oldName];
    parent.children[newName].name = newName;

    if (oldName !== newName) {
      delete parent.children[oldName];
    }

    this.setLocalStorage({ root, version });
    return Promise.resolve({ oldPath: path, newName });
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  deleteNode(path: Path): Promise<{ path: Path }> {
    const { root, version } = this.getLocalStorage();
    const parentPath = path.slice(0, -1);
    const name = path[path.length - 1];
    let parent: Node | undefined = root;
    for (const part of parentPath) {
      parent = parent?.children?.[part];
    }

    if (
      !parent ||
      !parent.isDirectory ||
      !parent.children.hasOwnProperty(name)
    ) {
      throw new NotFoundError();
    }

    delete parent.children[name];
    this.setLocalStorage({
      root,
      version,
    });
    return Promise.resolve({
      path,
    });
  }

  /**
   * @inheritdoc
   * @memberof LocalStorageApi
   */
  async moveNode(
    nodePath: Path,
    newParentPath: Path
  ): Promise<{ oldPath: Path; newPath: Path }> {
    const { root, version } = this.getLocalStorage();
    const name = nodePath[nodePath.length - 1];
    const parentPath = nodePath.slice(0, -1);

    if (
      parentPath.length === newParentPath.length &&
      parentPath.every((p, i) => newParentPath[i] === p)
    ) {
      // old parent and new parent are the same so nothing to do.
      return { oldPath: nodePath, newPath: nodePath };
    }

    let oldParent: Node | undefined = root;
    for (const part of parentPath) {
      oldParent = oldParent?.children?.[part];
    }

    if (
      !oldParent ||
      !oldParent.isDirectory ||
      !oldParent.children.hasOwnProperty(name)
    ) {
      throw new NotFoundError();
    }

    let newParent: Node | undefined = root;
    for (const part of newParentPath) {
      newParent = newParent?.children?.[part];
    }

    if (!newParent || !newParent.isDirectory) {
      throw new NotFoundError();
    }

    if (newParent.children.hasOwnProperty(name)) {
      throw new DuplicateError();
    }

    newParent.children[name] = oldParent.children[name];
    delete oldParent.children[name];

    this.setLocalStorage({ root, version });

    return { oldPath: nodePath, newPath: [...newParentPath, name] };
  }

  private readonly key = '_markdown_notebook_storage';

  getLoginButtonText() {
    return (
      <div>
        <div>In this browser</div>
        <small>without synchronization</small>
      </div>
    );
  }

  getLoginUi() {
    return (props: { onDone: () => void }) => {
      return (
        <div>
          <div>
            <strong>Attention!</strong> As soon as cookies and browser data are
            deleted, all your notes are lost.
          </div>

          <Button
            themeColor='primary'
            type='button'
            onClick={props.onDone}
            style={{ marginTop: '1rem' }}
          >
            Confirm
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
      root: {
        name: '/',
        children: {},
        isDirectory: true,
      } as DirectoryNode,
    };
    this.setLocalStorage(storage);
    return storage;
  }
}
