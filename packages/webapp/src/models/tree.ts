import { Path } from 'src/models/node';

/**
 * A tree whose nodes can have a payload of type `TPayload` and may have a
 * number of child nodes.
 */
export type Tree<TPayload> = {
  children: {
    [nodeName: string]: Tree<TPayload> | undefined;
  };
  payload: TPayload | undefined;
};

/**
 * Creates and returns an empty tree.
 *
 * @export
 * @template TPayload
 * @returns {Tree<TPayload>}
 */
export function createEmptyTree<TPayload>(): Tree<TPayload> {
  return {
    children: {},
    payload: undefined,
  };
}

/**
 * Gets the value indicating whether the given tree node has at least one child.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} treeNode
 * @returns {boolean}
 */
export function hasTreeNodeChildren<TPayload>(
  treeNode: Tree<TPayload>
): boolean {
  return Object.keys(treeNode.children).length > 0;
}

/**
 * Gets the list of names of all children of the given tree node.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} treeNode
 * @returns {string[]}
 */
export function getTreeNodeChildNames<TPayload>(
  treeNode: Tree<TPayload>
): string[] {
  return Object.keys(treeNode.children);
}

/**
 * Finds the tree node associated to the given path.
 * Returns `undefined` if there is no node matching the path.
 * Returns the subtree with the matched node as the root if there is a node
 * matching the given path.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} path
 * @returns {Tree<TPayload>}
 */
export function getTreeNode<TPayload>(
  tree: Tree<TPayload>,
  path: Path
): Tree<TPayload> | undefined {
  let current: Tree<TPayload> | undefined = tree;
  for (const part of path) {
    if (current === undefined) {
      return undefined;
    }

    current = current.children[part];
  }

  return current;
}

/**
 * Sets the tree node associated to the given path. Creates all non existing
 * nodes along the path.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} path
 * @param {Tree<TPayload>} node
 */
export function setTreeNode<TPayload>(
  tree: Tree<TPayload>,
  path: Path,
  node: Tree<TPayload>
) {
  let current: Tree<TPayload> = tree;
  for (const part of path) {
    if (typeof current.children[part] !== 'object') {
      current.children[part] = {
        children: {},
        payload: undefined,
      };
    }

    current = current.children[part]!;
  }

  current.children = node.children;
  current.payload = node.payload;
}

/**
 * Finds the tree node associated to the given path and returns its payload.
 * If the node does not exist this function returns `undefined`.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} path
 * @returns {(TPayload | undefined)}
 */
export function getTreeNodePayload<TPayload>(
  tree: Tree<TPayload>,
  path: Path
): TPayload | undefined {
  return getTreeNode(tree, path)?.payload;
}

/**
 * Sets the payload of the tree node associated to the given path. Creates all
 * non existing parents along the path to the node.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} path
 * @param {(TPayload | undefined)} payload
 */
export function setTreeNodePayload<TPayload>(
  tree: Tree<TPayload>,
  path: Path,
  payload: TPayload | undefined
) {
  const currentNode = getTreeNode(tree, path);
  const children = currentNode?.children || {};
  setTreeNode(tree, path, { children, payload });
}

/**
 * Moves the subtree with the root node specified by the given
 * `subtreePath` to a new parent node specified by the `newParentPath`. This
 * means the node represented by `subtreePath` will be moved from its old parent
 * to be a child of the node represented by `newParentPath`.
 *
 * If there is no subtree associated to `subtreePath`, this function does
 * nothing.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} subtreePath
 * @param {Path} newParentPath
 */
export function moveSubtree<TPayload>(
  tree: Tree<TPayload>,
  subtreePath: Path,
  newParentPath: Path
) {
  // Find the current parent of the subtree to move.
  let oldParent: Tree<TPayload> | undefined = tree;
  for (const part of subtreePath.slice(0, -1)) {
    if (!oldParent?.children.hasOwnProperty(part)) {
      // An intermediate node does not exist so the desired subtree does not exist
      // so nothing to do.
      return;
    }

    oldParent = oldParent.children[part];
  }

  if (!oldParent) {
    // There is no node that matches subtreePath[..-1].
    return;
  }

  const subtree = oldParent.children[subtreePath[subtreePath.length - 1]];
  if (!subtree) {
    // There is no node that matches subtreePath.
    return;
  }

  // Attach the subtree to the new parent.
  setTreeNode(
    tree,
    // Append the subtree root node name to the new parent path to get the
    // actual new path of the subtree.
    [...newParentPath, subtreePath[subtreePath.length - 1]],
    subtree
  );
  // Remove the subtree from the old parent.
  delete oldParent.children[subtreePath[subtreePath.length - 1]];
}

/**
 * Changes the name of the tree node specified by the given `nodePath` path.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} nodePath
 * @param {string} newName
 */
export function changeTreeNodeName<TPayload>(
  tree: Tree<TPayload>,
  nodePath: Path,
  newName: string
) {
  const oldName = nodePath[nodePath.length - 1];
  if (oldName === newName) {
    return;
  }

  const parentPath = nodePath.slice(0, -1);
  const parent = getTreeNode(tree, parentPath);
  if (!parent || !parent.children.hasOwnProperty(oldName)) {
    return;
  }

  parent.children[newName] = parent.children[oldName];
  delete parent.children[oldName];
}

/**
 * Removes the tree node specified by the given path from the given tree.
 * Also removes all parent nodes that have no payload and no children left after
 * the removal of the specified node.
 *
 * @export
 * @template TPayload
 * @param {Tree<TPayload>} tree
 * @param {Path} path
 */
export function removeTreeNode<TPayload>(tree: Tree<TPayload>, path: Path) {
  // Removes the node associated to currentPath from its parent. If the parent
  // has no other children, set currentPath to the path representing the parent
  // and start over, until a parent is found that has either a payload or other
  // children.

  let currentPath = path.slice();
  let parent: Tree<TPayload> | undefined = undefined;
  do {
    if (currentPath.length === 0) {
      tree.children = {};
      tree.payload = undefined;
      return;
    }

    const parentPath = currentPath.slice(0, -1);
    const nodeName = currentPath[currentPath.length - 1];
    parent = getTreeNode(tree, parentPath);

    if (!parent || !parent.children.hasOwnProperty(nodeName)) {
      return;
    }

    delete parent.children[nodeName];
    currentPath = parentPath;
  } while (
    // Continue as long as the parent has no other children and no payload.
    parent &&
    Object.keys(parent.children).length === 0 &&
    parent.payload === undefined
  );
}
