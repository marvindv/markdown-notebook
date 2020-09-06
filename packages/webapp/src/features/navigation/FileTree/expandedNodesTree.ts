import { Tree } from 'src/models/tree';

/**
 * A tree to store the expanded state of nodes. A node with the payload `true`
 * is be expanded.
 */
export type ExpandedNodesTree = Tree<true>;
