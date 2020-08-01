import { faFileAlt as faFileAltRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronDown,
  faChevronRight,
  faFileAlt as faFileAltSolid,
} from '@fortawesome/free-solid-svg-icons';
import { transparentize } from 'polished';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragObjectWithType, useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DropdownItem } from 'src/components/Dropdown';
import { DndItemTypes } from 'src/dnd-types';
import { UnsavedChangesNode } from 'src/features/nodes/nodesSlice';
import useCombinedRefs from 'src/hooks/useCombinedRefs';
import { DirectoryNode, Node, Path } from 'src/models/node';
import { getTreeNodePayload, hasTreeNodeChildren } from 'src/models/tree';
import styled, { css } from 'styled-components';
import CustomDragLayer from './CustomDragLayer';
import { getCollisionFreeName } from './helper';
import { NodeNameEditingTreeNode } from './nodeNameEditingSlice';
import TreeNodeHead from './TreeNodeHead';

const StyledTreeNodeHead = styled(TreeNodeHead)``;

/**
 * An element that contains one {@link TreeNodeHead} element and none to many
 * {@link TreeNodeContainer} child elements.
 */
const TreeNodeContainer = styled.div<{
  isRoot: boolean;
  indentLevel: number;
  isDragging: boolean;
  isHovering: boolean;
}>`
  user-select: none;
  width: 100%;

  // Make sure there is enough white space of the root TreeNode so the user can
  // drop a node into the root, even if there are no files in the root.
  ${({ isRoot }) =>
    isRoot &&
    css`
      min-height: 100%;
      padding-bottom: 3rem;
    `}

  ${({ isDragging }) =>
    isDragging &&
    css`
      opacity: 0.5;
      cursor: move;
    `}

  ${({ isHovering, theme }) =>
    isHovering &&
    css`
      background: ${transparentize(0.5, theme.baseColors.secondary)};
    `}

  // The usage of an IndentWidth element or something like that that gets a
  // constant width based on the indentLevel instead of using a padding might be
  // an easier starting point when implementing indent guides.
  // Also very important to make sure we only select direct descendants.
  // Otherwise this rule might override nested StyledTreeNodeHead after this
  // rule changed through a props change.
  // 1.25rem + 0.25rem = 1.5rem - 1.25 is the width of a FontAwesomeIcon with
  // "fixedWidth" set. 0.25rem is the padding of the name in TreeNodeHead.
  // This way the indentation nicely aligns with the parents name.
  & > ${StyledTreeNodeHead} {
    padding-left: calc(1rem + (1.5rem * ${props => props.indentLevel}));
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
  onNodeMove: (node: Path, newParent: Path) => void;
  onSelectCustomRoot: (node: Path) => void;
};

export interface NodeDragObject extends DragObjectWithType {
  name: string;
  path: Path;
}

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
  const [isHovering, setHovering] = useState(false);

  const deleteConfirmText = useMemo(() => {
    if (node.isDirectory) {
      return `Are you sure you want to delete the ${node.name} folder and its contents?`;
    }

    return `Are you sure you want to delete the ${node.name} note?`;
  }, [node]);

  const [{ isDragging }, dragRef, preview] = useDrag<
    NodeDragObject,
    {},
    { isDragging: boolean }
  >({
    item: { type: DndItemTypes.Node, name: node.name, path: props.path },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const [{ isDropHover }, dropRef] = useDrop({
    // Prevent drop into a file node.
    accept: node.isDirectory ? DndItemTypes.Node : 'none',
    drop: (ev: NodeDragObject, monitor) => {
      if (monitor.didDrop()) {
        // The drop event was already handled by a child element, i.e. the node
        // was dropped in a child directory somewhere down the tree.
        return;
      }

      props.onNodeMove(ev.path, props.path);
    },
    canDrop: (dropItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        return false;
      }

      // Prevent that the node can be dropped into its current parent.
      if (dropItem.path.length - 1 === props.path.length) {
        // The parent path of the dropItem has the same length as the node its
        // dropped into so its possible the dropItem is dropped in its parent.
        const parentPath = dropItem.path.slice(0, -1);
        return !parentPath.every((part, i) => part === props.path[i]);
      }

      // Prevent a node to be dropped into itself or one of its children.
      // The dropItem is dropped into a child if the path of this element
      // starts with every path part of dropItem, i.e. the dropItem node is a
      // parent of this node.
      return !dropItem.path.every((part, i) => part === props.path[i]);
    },
    collect: monitor => ({
      isDropHover: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });

  const hoverExpandTimer: React.MutableRefObject<number | null> = useRef<
    number
  >(null);
  useEffect(() => {
    setHovering(isDropHover);

    // Use no longer hovers over this element but the expand timer is still
    // running, so stop the timer.
    if (!isDropHover && hoverExpandTimer.current !== null) {
      clearTimeout(hoverExpandTimer.current);
      hoverExpandTimer.current = null;
    }

    // If the user hovers over this node and its collapsed, expand if the user
    // hovers for at least 1 second.
    if (
      isDropHover &&
      node.isDirectory &&
      collapsed &&
      hoverExpandTimer.current === null
    ) {
      hoverExpandTimer.current = setTimeout(() => setCollapse(false), 1000);
    }
  }, [isDropHover, collapsed, setCollapse, node.isDirectory]);

  const dragDropRef = useCombinedRefs<HTMLDivElement>(dragRef, dropRef);

  const icon = node.isDirectory
    ? collapsed
      ? faChevronRight
      : faChevronDown
    : unsavedNodesSubtree?.payload === true
    ? faFileAltSolid
    : faFileAltRegular;

  const saveButtonEnabled =
    unsavedNodesSubtree &&
    (hasTreeNodeChildren(unsavedNodesSubtree) ||
      getTreeNodePayload(unsavedNodesSubtree, []) === true);

  const isActive =
    !node.isDirectory &&
    props.path.every((part, i) => part === props.selectedPath[i]);

  const dropdownItems: DropdownItem[] = [];
  if (node.isDirectory) {
    dropdownItems.push(
      {
        label: 'New note',
        onClick: () => {
          const name = getCollisionFreeName(
            'New note',
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
        label: 'New directory',
        onClick: () => {
          const name = getCollisionFreeName(
            'New directory',
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
        label: 'Show only this directory',
        onClick: () => props.onSelectCustomRoot(props.path),
      },
      {
        isSpacer: true,
      }
    );
  }

  dropdownItems.push(
    {
      label: 'Save',
      disabled: !saveButtonEnabled,
      onClick: () => props.onSaveClick(props.path),
    },
    {
      label: 'Change name',
      onClick: () => props.onNodeNameEditingChange(props.path, true),
    },
    {
      label: 'Delete',
      onClick: () => {
        const decision = window.confirm(deleteConfirmText);
        if (decision) {
          props.onDeleteClick(props.path);
        }
      },
    }
  );

  return (
    <TreeNodeContainer
      ref={dragDropRef}
      isRoot={props.isRoot}
      indentLevel={props.indentLevel}
      isDragging={isDragging}
      isHovering={isHovering}
    >
      {(props.renderRootHead || !props.isRoot) && (
        <StyledTreeNodeHead
          className={isActive ? 'active' : ''}
          icon={icon}
          text={props.node.name}
          isTextEditing={props.nodeNameEditingTree?.payload === true}
          dropdownItems={dropdownItems}
          onClick={() =>
            node.isDirectory
              ? setCollapse(!collapsed)
              : props.onFileClick(props.path)
          }
          onDoubleClick={() =>
            node.isDirectory && props.onSelectCustomRoot(props.path)
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

  if (props.collapsed) {
    return <></>;
  }

  // If this is the root, discard the given indentLevel and start with 0.
  return (
    <>
      {sortedChildrenNames.map(name => (
        <TreeNode
          {...props}
          isRoot={false}
          renderRootHead={false}
          node={props.node.children[name]}
          unsavedNodesSubtree={props.unsavedNodesSubtree?.children?.[name]}
          path={[...props.path, name]}
          key={name}
          indentLevel={
            !props.renderRootHead && props.isRoot ? 0 : props.indentLevel + 1
          }
          nodeNameEditingTree={props.nodeNameEditingTree?.children?.[name]}
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
  unsavedNodes: UnsavedChangesNode | undefined;
  currentPath: Path;
  onFileClick: (path: Path) => void;
  onSaveClick: (path: Path) => void;
  onDeleteClick: (path: Path) => void;
  nodeNameEditingTree: NodeNameEditingTreeNode | undefined;
  onNodeNameChange: (path: Path, newName: string) => void;
  onNodeNameEditingChange: (path: Path, isTextEditing: boolean) => void;
  onNewNode: (parentPath: Path, node: Node) => void;
  onNodeMove: (nodePath: Path, newParent: Path) => void;
  onSelectCustomRoot: (path: Path) => void;
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
export default function FileTree(props: Props) {
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
