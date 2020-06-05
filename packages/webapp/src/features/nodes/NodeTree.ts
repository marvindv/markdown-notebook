import { Path } from 'src/models/node';

/**
 * A tree whose leafs contain a label of type `TPayload`.
 */
export type NodeTree<TPayload> = {
  [nodeName: string]: NodeTreeNode<TPayload> | undefined;
};

export type NodeTreeNode<TPayload> = NodeTree<TPayload> | TPayload;

/**
 * Gets the tree node associated to the given path or returns `undefined` if
 * there is no node matching the path.
 *
 * @export
 * @template TPayload
 * @param {NodeTree<TPayload>} tree
 * @param {Path} path
 * @returns {(NodeTreeNode<TPayload> | undefined)}
 */
export function getNodeFromTree<TPayload>(
  tree: NodeTree<TPayload>,
  path: Path
): NodeTreeNode<TPayload> | undefined {
  let currentNode: NodeTreeNode<TPayload> | undefined = tree;
  for (const part of path) {
    if (!(currentNode instanceof Object)) {
      return undefined;
    }

    currentNode = currentNode[part];
  }

  return currentNode;
}

/**
 * Adds or sets the label value of the leaf specified specified by the given
 * path in place.
 *
 * @export
 * @template TPayload
 * @param {NodeTree<TPayload>} tree
 * @param {Path} path
 * @param {TPayload} payload
 */
export function setLeafValue<TPayload>(
  tree: NodeTree<TPayload>,
  path: Path,
  payload: TPayload
) {
  // Create the nodes up to the last part of the given path, overriding
  // intermediate payloads if there are any.
  let currentNode: NodeTree<TPayload> = tree;
  for (const part of path.slice(0, -1)) {
    if (typeof currentNode[part] !== 'object') {
      currentNode[part] = {};
    }

    currentNode = currentNode[part] as NodeTree<TPayload>;
  }

  currentNode[path[path.length - 1]] = payload;
}

/**
 * Removes the given path from the tree by altering the given tree object.
 *
 * @export
 * @template TPayload
 * @param {Path} path
 * @param {NodeTree<TPayload>} tree
 */
export function removePathFromTree<TPayload>(
  tree: NodeTree<TPayload>,
  path: Path
) {
  // Collect all nodes down to the specified path.
  let nodes: NodeTreeNode<TPayload>[] = [];
  let currentNode: NodeTreeNode<TPayload> | undefined = tree;
  for (const part of path) {
    // An intermediate node does not exist or is a leaf so nothing to do since
    // there is no node with the given path in this tree.
    if (
      typeof currentNode !== 'object' ||
      !(currentNode as Object).hasOwnProperty(part)
    ) {
      return;
    }

    currentNode = (currentNode as any)[part];
    if (currentNode) {
      nodes.push(currentNode);
    }
  }

  // Remove the nodes that are in the path of the deleted node and hove no
  // other children then the one in the given path.
  // For that find the first parent node that has more then one child.

  // Generate the trace through the nodes, which is a list of pairs of nodes
  // and the path part associated to that node.
  const trace: [NodeTreeNode<TPayload>, string][] = [...zip(nodes, path)];
  // We go through the trace from bottom to top, i.e. backtracking.
  const backtrack = trace.reverse();
  // Skip the last element of the trace since its the deleted node, which is
  // always removed.
  let firstNodeWithMoreChildren: [NodeTreeNode<TPayload>, string] | undefined;
  for (let i = 1; i < backtrack.length; i++) {
    const [parent, parentName] = backtrack[i];

    if (parent instanceof Object && Object.keys(parent).length > 1) {
      firstNodeWithMoreChildren = [parent, parentName];
      // We have the first parent that has more than one child node.
      // Remove the child node of that parent that belongs to the given path.
      // Note: backtrace[i - 1] will never be undefined since we start at i=1.
      const [, deletePathPart] = backtrack[i - 1];
      delete parent[deletePathPart];
      break;
    }
  }

  if (!firstNodeWithMoreChildren) {
    // We reached the root of `tree` without finding a node with more than one
    // child. That means we have to remove the starting part of the given path
    // from the `tree` root.
    delete tree[path[0]];
  }
}

function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  return arr1.map((t, i) => [t, arr2[i]]);
}

export function changeTreeNodeName(
  tree: NodeTree<any>,
  path: Path,
  newName: string
) {
  let parent: NodeTree<any> | undefined = tree;
  // Try to traverse the tree to the parent if there is one.
  for (const part of path.slice(0, -1)) {
    if (typeof parent !== 'object') {
      return;
    }

    parent = parent[part];
  }

  const oldName = path[path.length - 1];
  if (parent instanceof Object && typeof parent[oldName] !== 'undefined') {
    parent[newName] = parent[oldName];
    delete parent[oldName];
  }
}
