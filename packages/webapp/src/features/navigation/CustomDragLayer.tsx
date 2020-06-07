import { transparentize } from 'polished';
import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { DndItemTypes } from 'src/dnd-types';
import styled from 'styled-components';
import { NodeDragObject } from './FileTree';

// Based on https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

const NodeDragPreviewContainer = styled.span`
  display: inline-block;
  background-color: white;

  // Bg of .inner on white to replicate the style of TreeNodeHead.
  &,
  .inner {
    border-radius: ${({ theme }) => theme.base.borderRadius};
  }

  .inner {
    padding: 0.5rem;
    background-color: ${({ theme }) =>
      transparentize(0.25, theme.borders.color)};
  }
`;

const NodeDragPreview = (props: { item: NodeDragObject }) => {
  const { item } = props;
  return (
    <NodeDragPreviewContainer>
      <div className='inner'>{item.name}</div>
    </NodeDragPreviewContainer>
  );
};

/**
 * The CustomDragLayer enables a customized drag element style. With it dragged
 * `TreeNode` render just with the node name instead of the whole subtree.
 *
 * @export
 * @returns
 */
export default function CustomDragLayer() {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case DndItemTypes.Node:
        return <NodeDragPreview item={item} />;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
}
