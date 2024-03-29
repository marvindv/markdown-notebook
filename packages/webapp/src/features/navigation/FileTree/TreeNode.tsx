import {
  faFile,
  faFileAlt as faFileAltRegular,
  faFolder,
} from '@fortawesome/free-regular-svg-icons';
import {
  faBullseye,
  faChevronDown,
  faChevronRight,
  faEdit,
  faFileAlt as faFileAltSolid,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { transparentize } from 'polished';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DropdownItem } from 'src/components/Dropdown';
import { DndItemTypes } from 'src/dnd-types';
import { UnsavedChangesTree } from 'src/features/nodes/nodesSlice';
import useCombinedRefs from 'src/hooks/useCombinedRefs';
import { DirectoryNode, Node, Path } from 'src/models/node';
import { getTreeNodePayload, hasTreeNodeChildren, Tree } from 'src/models/tree';
import styled, { css } from 'styled-components';
import { getCollisionFreeName } from '../helper';
import { ExpandedNodesTree } from './expandedNodesTree';
import { NodeDragObject } from './nodeDragObject';
import { NodeNameEditingTree } from './nodeNameEditingTree';
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
  isHighlighted: boolean;
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

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    css`
      & > ${StyledTreeNodeHead} {
        background: ${transparentize(0.5, theme.baseColors.primary)};
      }
    `}

  & > ${StyledTreeNodeHead} {
    transition: background 0.2s ease-out;

    // The usage of an IndentWidth element or something like that that gets a
    // constant width based on the indentLevel instead of using a padding might be
    // an easier starting point when implementing indent guides.
    // Also very important to make sure we only select direct descendants.
    // Otherwise this rule might override nested StyledTreeNodeHead after this
    // rule changed through a props change.
    // 1.25rem + 0.25rem = 1.5rem - 1.25 is the width of a FontAwesomeIcon with
    // "fixedWidth" set. 0.25rem is the padding of the name in TreeNodeHead.
    // This way the indentation nicely aligns with the parents name.
    padding-left: calc(1rem + (1.5rem * ${props => props.indentLevel}));
  }
`;

type NodeProps<T> = T & {
  isRoot: boolean;
  renderRootHead: boolean;
  indentLevel: number;
  path: Path;
  selectedPath: Path;
  nodeNameEditingTree: NodeNameEditingTree | undefined;
  expandedNodes: ExpandedNodesTree | undefined;
  unsavedNodesSubtree: UnsavedChangesTree | undefined;
  pendingFocusedNodes: Tree<true> | undefined;
  highlightedNodes: Tree<true> | undefined;
  onFileClick: (path: Path) => void;
  onSaveClick: (path: Path) => void;
  onDeleteClick: (path: Path) => void;
  onNodeNameChange: (path: Path, newName: string) => void;
  onNodeNameEditingChange: (path: Path, isTextEditing: boolean) => void;
  onNewNode: (parentPath: Path, node: Node) => void;
  onNodeMove: (node: Path, newParent: Path) => void;
  onSelectCustomRoot: (node: Path) => void;
  onIsNodeExpandedChange: (node: Path, isExpanded: boolean) => void;
  onNodeFocused: (node: Path) => void;
};

function DirectoryTreeNodeBody(
  props: NodeProps<{
    node: DirectoryNode;
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
          expandedNodes={props.expandedNodes?.children?.[name]}
          pendingFocusedNodes={props.pendingFocusedNodes?.children?.[name]}
          highlightedNodes={props.highlightedNodes?.children?.[name]}
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

export function TreeNode(
  props: NodeProps<{
    node: Node;
  }>
) {
  const {
    isRoot,
    node,
    path,
    unsavedNodesSubtree,
    expandedNodes,
    pendingFocusedNodes,
    highlightedNodes,
    onIsNodeExpandedChange,
    onNodeFocused,
  } = props;
  const collapsed = isRoot ? false : expandedNodes?.payload !== true;
  const isFocusPending = pendingFocusedNodes?.payload === true;
  const isHighlighted = highlightedNodes?.payload === true;
  const [isHovering, setHovering] = useState(false);

  const deleteConfirmText = useMemo(() => {
    if (node.isDirectory) {
      return `Are you sure you want to delete the ${node.name} folder and its contents?`;
    }

    return `Are you sure you want to delete the ${node.name} note?`;
  }, [node]);

  // Scroll this tree node into view if isFocused changes to true.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFocusPending && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
      onNodeFocused(path);
    }
  }, [isFocusPending, onNodeFocused, path]);

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
      hoverExpandTimer.current = setTimeout(
        () => onIsNodeExpandedChange(path, true),
        1000
      );
    }
  }, [isDropHover, collapsed, node.isDirectory, path, onIsNodeExpandedChange]);

  const ref = useCombinedRefs<HTMLDivElement>(containerRef, dragRef, dropRef);

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
        icon: faFile,
        label: 'New note',
        onClick: () => {
          const name = getCollisionFreeName(
            'New note',
            Object.keys(node.children)
          );
          props.onIsNodeExpandedChange(path, true);
          props.onNewNode(props.path, {
            isDirectory: false,
            content: '',
            name,
          });
        },
      },
      {
        icon: faFolder,
        label: 'New directory',
        onClick: () => {
          const name = getCollisionFreeName(
            'New directory',
            Object.keys(node.children)
          );
          props.onIsNodeExpandedChange(path, true);
          props.onNewNode(props.path, {
            isDirectory: true,
            children: {},
            name,
          });
        },
      },
      {
        icon: faBullseye,
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
      icon: faSave,
      label: 'Save',
      disabled: !saveButtonEnabled,
      onClick: () => props.onSaveClick(props.path),
    },
    {
      icon: faEdit,
      label: 'Change name',
      onClick: () => props.onNodeNameEditingChange(props.path, true),
    },
    {
      icon: faTrash,
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
      ref={ref}
      isRoot={props.isRoot}
      indentLevel={props.indentLevel}
      isDragging={isDragging}
      isHovering={isHovering}
      isHighlighted={isHighlighted}
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
              ? props.onIsNodeExpandedChange(path, collapsed)
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
