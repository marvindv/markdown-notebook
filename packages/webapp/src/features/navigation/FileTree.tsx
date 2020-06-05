import { faFileAlt as faFileAltRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronDown,
  faChevronRight,
  faFileAlt as faFileAltSolid,
} from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { DropdownItem } from 'src/components/Dropdown';
import {
  NodesWithUnsavedChangesTree,
  UnsavedChangesNode,
} from 'src/features/nodes/nodesSlice';
import { DirectoryNode, Node, Path } from 'src/models/node';
import styled from 'styled-components';
import { getCollisionFreeName } from './helper';
import {
  NodeNameEditingTree,
  NodeNameEditingTreeNode,
} from './nodeNameEditingSlice';
import TreeNodeHead from './TreeNodeHead';

const StyledTreeNodeHead = styled(TreeNodeHead)``;

/**
 * An element that contains one {@link TreeNodeHead} element and none to many
 * {@link TreeNodeContainer} child elements.
 */
const TreeNodeContainer = styled.div<{ indentLevel: number }>`
  user-select: none;
  width: 100%;

  // The usage of an IndentWidth element or something like that that gets a
  // constant width based on the indentLevel instead of using a padding might be
  // an easier starting point when implementing indent guides.
  ${StyledTreeNodeHead} {
    padding-left: calc(1rem + (1rem * ${props => props.indentLevel}));
  }
`;

type NodeProps<T> = T & {
  indentLevel: number;
  path: Path;
  selectedPath: Path;
  onFileClick: (path: Path) => void;
  onSaveClick: (path: Path) => void;
  onDeleteClick: (path: Path) => void;
  nodeNameEditingTree: NodeNameEditingTreeNode | undefined;
  onNodeNameChange: (path: Path, newName: string) => void;
  onNodeNameEditingChange: (path: Path, isTextEditing: boolean) => void;
  onNewNode: (parentPath: Path, node: Node) => void;
};

function TreeNode(
  props: NodeProps<{
    isRoot: boolean;
    renderRootHead: boolean;
    node: Node;
    unsavedNodesSubtree: UnsavedChangesNode | undefined;
  }>
) {
  const { node, unsavedNodesSubtree } = props;
  const [collapsed, setCollapse] = useState(!props.isRoot);

  // If this node belongs to the path of the currently selected node but is
  // collapsed, force uncollapse to make the selected node visible in the tree.
  useEffect(() => {
    if (collapsed && props.path.every((p, i) => props.selectedPath[i] === p)) {
      setCollapse(false);
    }
  }, [props.selectedPath, props.path, collapsed]);

  const deleteConfirmText = useMemo(() => {
    if (node.isDirectory) {
      return `Möchtest du den Ordner ${node.name} inklusive Inhalt wirklich löschen?`;
    }

    return `Möchtest du die Datei ${node.name} wirklich löschen?`;
  }, [node]);

  const icon = node.isDirectory
    ? collapsed
      ? faChevronRight
      : faChevronDown
    : unsavedNodesSubtree === true
    ? faFileAltSolid
    : faFileAltRegular;

  const saveButtonEnabled =
    typeof props.unsavedNodesSubtree === 'object' ||
    props.unsavedNodesSubtree === true;

  const isActive =
    !node.isDirectory &&
    props.path.every((part, i) => part === props.selectedPath[i]);

  const dropdownItems: DropdownItem[] = [];
  if (node.isDirectory) {
    dropdownItems.push(
      {
        label: 'Neue Notiz',
        onClick: () => {
          const name = getCollisionFreeName(
            'Neue Notiz',
            Object.keys(node.children)
          );
          setCollapse(false);
          props.onNewNode(props.path, {
            isDirectory: false,
            content: '',
            name,
          });
        },
      },
      {
        label: 'Neuer Ordner',
        onClick: () => {
          const name = getCollisionFreeName(
            'Neuer Ordner',
            Object.keys(node.children)
          );
          setCollapse(false);
          props.onNewNode(props.path, {
            isDirectory: true,
            children: {},
            name,
          });
        },
      },
      {
        isSpacer: true,
      }
    );
  }

  dropdownItems.push(
    {
      label: 'Speichern',
      disabled: !saveButtonEnabled,
      onClick: () => props.onSaveClick(props.path),
    },
    {
      label: 'Name ändern',
      onClick: () => props.onNodeNameEditingChange(props.path, true),
    },
    {
      label: 'Löschen',
      onClick: () => {
        const decision = window.confirm(deleteConfirmText);
        if (decision) {
          props.onDeleteClick(props.path);
        }
      },
    }
  );

  return (
    <TreeNodeContainer indentLevel={props.indentLevel}>
      {(props.renderRootHead || !props.isRoot) && (
        <StyledTreeNodeHead
          className={isActive ? 'active' : ''}
          icon={icon}
          text={props.node.name}
          isTextEditing={props.nodeNameEditingTree === true}
          dropdownItems={dropdownItems}
          onClick={() =>
            node.isDirectory
              ? setCollapse(!collapsed)
              : props.onFileClick(props.path)
          }
          onTextChange={newText => props.onNodeNameChange(props.path, newText)}
          onTextEditingChange={isTextEditing =>
            props.onNodeNameEditingChange(props.path, isTextEditing)
          }
        />
      )}

      {node.isDirectory && (
        <DirectoryTreeNodeBody {...props} node={node} collapsed={collapsed} />
      )}
    </TreeNodeContainer>
  );
}

function DirectoryTreeNodeBody(
  props: NodeProps<{
    isRoot: boolean;
    renderRootHead: boolean;
    node: DirectoryNode;
    unsavedNodesSubtree: UnsavedChangesNode | undefined;
    collapsed: boolean;
  }>
) {
  const sortedChildrenNames = useMemo(() => {
    return Object.keys(props.node.children).sort((a, b) => {
      const nodeA = props.node.children[a];
      const nodeB = props.node.children[b];

      // Directory children appear before file children.
      if (nodeA.isDirectory && !nodeB.isDirectory) {
        return -1;
      }

      if (!nodeA.isDirectory && nodeB.isDirectory) {
        return 1;
      }

      // Then sort by node name.
      return nodeA.name.localeCompare(nodeB.name);
    });
  }, [props.node.children]);

  // If this is the root, discard the given indentLevel and start with 0.
  if (props.collapsed) {
    return <></>;
  }

  return (
    <>
      {sortedChildrenNames.map(name => (
        <TreeNode
          {...props}
          isRoot={false}
          renderRootHead={false}
          node={props.node.children[name]}
          unsavedNodesSubtree={
            typeof props.unsavedNodesSubtree === 'object'
              ? props.unsavedNodesSubtree[name]
              : undefined
          }
          path={[...props.path, name]}
          key={name}
          indentLevel={
            !props.renderRootHead && props.isRoot ? 0 : props.indentLevel + 1
          }
          nodeNameEditingTree={
            typeof props.nodeNameEditingTree === 'object'
              ? props.nodeNameEditingTree[name]
              : undefined
          }
        />
      ))}
    </>
  );
}

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
  unsavedNodes: NodesWithUnsavedChangesTree;
  currentPath: Path;
  onFileClick: (path: Path) => void;
  onSaveClick: (path: Path) => void;
  onDeleteClick: (path: Path) => void;
  nodeNameEditingTree: NodeNameEditingTree;
  onNodeNameChange: (path: Path, newName: string) => void;
  onNodeNameEditingChange: (path: Path, isTextEditing: boolean) => void;
  onNewNode: (parentPath: Path, node: Node) => void;
}

/**
 * Renders a complete file structure based on a given root node.
 *
 * @export
 * @param {Props} props
 * @returns
 */
export default function FileTree(props: Props) {
  const renderRootHead =
    typeof props.renderRootHead === 'boolean' ? props.renderRootHead : true;
  return (
    <FileTreeContainer className={props.className}>
      <TreeNode
        {...props}
        renderRootHead={renderRootHead}
        isRoot={true}
        node={props.rootNode}
        unsavedNodesSubtree={props.unsavedNodes}
        path={[]}
        selectedPath={props.currentPath}
        indentLevel={0}
      />
    </FileTreeContainer>
  );
}
