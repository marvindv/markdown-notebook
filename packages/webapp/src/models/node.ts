import { InvalidPathError } from 'src/features/api';

export type NodeName = string;

export interface BaseNode {
  name: NodeName;
  isDirectory: boolean;
  children?: { [nodeName: string]: Node } | undefined;
  content?: string | undefined;
}

export interface FileNode extends BaseNode {
  isDirectory: false;
  children?: undefined;
  content: string;
}

export interface DirectoryNode extends BaseNode {
  isDirectory: true;
  children: { [nodeName: string]: Node };
  content?: undefined;
}

export type Node = FileNode | DirectoryNode;

export type Path = NodeName[];

export default Node;

export function resolvePath(path: Path, root: Node): Node | undefined {
  let node: Node | undefined = root;
  for (const part of path) {
    if (!node) {
      return undefined;
    }

    if (!node.isDirectory) {
      // We have still path parts but reached a file.
      throw new InvalidPathError();
    }

    node = node.children[part];
  }

  return node;
}

export function resolvePathWithParent(
  path: Path,
  root: Node
): { node: Node; parent: DirectoryNode | null } | undefined {
  let parent: DirectoryNode | null = null;
  let node: Node | undefined = root;

  for (const part of path) {
    if (!node) {
      return undefined;
    }

    if (!node.isDirectory) {
      // We have still path parts but reached a file.
      throw new InvalidPathError();
    }

    parent = node;
    node = node.children[part];
  }

  if (node) {
    return { parent, node };
  }

  return undefined;
}
