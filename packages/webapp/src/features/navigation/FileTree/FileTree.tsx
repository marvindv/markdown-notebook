import React from 'react';
import { UnsavedChangesTree } from 'src/features/nodes/nodesSlice';
import { DirectoryNode, Node, Path } from 'src/models/node';
import { Tree } from 'src/models/tree';
import styled from 'styled-components';
import CustomDragLayer from './CustomDragLayer';
import { ExpandedNodesTree } from './expandedNodesTree';
import { NodeNameEditingTree } from './nodeNameEditingTree';
import { TreeNode } from './TreeNode';

const FileTreeContainer = styled.div``;

export interface Props {
  className?: string;
  /**
   * The value indicating whether the root should be rendered. If `false`, the
   * tree renders only the children of the root.
   *
   * Defaults to `true`.
   *
   * @type {boolean}
   * @memberof Props
   */
  renderRootHead?: boolean;
  rootNode: DirectoryNode;
  currentPath: Path;
  unsavedNodes: UnsavedChangesTree | undefined;
  nodeNameEditingTree: NodeNameEditingTree | undefined;
  expandedNodes: ExpandedNodesTree | undefined;
  pendingFocusedNodes: Tree<true> | undefined;
  highlightedNodes: Tree<true> | undefined;
  onFileClick: (path: Path) => void;
  onSaveClick: (path: Path) => void;
  onDeleteClick: (path: Path) => void;
  onNodeNameChange: (path: Path, newName: string) => void;
  onNodeNameEditingChange: (path: Path, isTextEditing: boolean) => void;
  onNewNode: (parentPath: Path, node: Node) => void;
  onNodeMove: (nodePath: Path, newParent: Path) => void;
  onSelectCustomRoot: (path: Path) => void;
  onIsNodeExpandedChange: (node: Path, isExpanded: boolean) => void;
  onNodeFocused: (node: Path) => void;
}

/**
 * Renders a complete file structure based on a given root node.
 *
 * TODO: As soon as this component is to be used somewhere other than just the
 * Navigation component, make the dropdown items of the TreeNode component a
 * prop so the dropdown of file and directory nodes can be adjusted to match
 * the parents context.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export function FileTree(props: Props) {
  const { className, rootNode, unsavedNodes, currentPath } = props;

  const renderRootHead =
    typeof props.renderRootHead === 'boolean' ? props.renderRootHead : true;

  return (
    <FileTreeContainer className={className}>
      <CustomDragLayer />
      <TreeNode
        {...props}
        renderRootHead={renderRootHead}
        isRoot={true}
        node={rootNode}
        unsavedNodesSubtree={unsavedNodes}
        path={[]}
        selectedPath={currentPath}
        indentLevel={0}
      />
    </FileTreeContainer>
  );
}

export default FileTree;
