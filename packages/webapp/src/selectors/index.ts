import { createSelector } from '@reduxjs/toolkit';
import { UnsavedChangesNode } from 'src/features/nodes/nodesSlice';
import { Node } from 'src/models/node';
import { RootState } from 'src/reducers';

const getCurrentPath = (state: RootState) => state.currentPath;
const getRootNode = (state: RootState) => state.nodes.root;
const getUnsavedNodes = (state: RootState) => state.nodes.unsavedNodes;

/**
 * Selects the currently selected notebook node.
 */
export const getCurrentNode = createSelector(
  [getCurrentPath, getRootNode],
  (currentPath, root) => {
    let node: Node | undefined = root;
    for (const part of currentPath) {
      node = node?.children?.[part];
    }

    return node;
  }
);

/**
 * Selects the value indicating whether there are currently unsaved changes in
 * any file.
 */
export const getHasUnsavedChanges = createSelector(
  [getUnsavedNodes],
  unsavedNodes => Object.keys(unsavedNodes).length > 0
);

/**
 * Selects the value indicating whether the currently selected node has unsaved
 * changes.
 */
export const getHasCurrentNodeUnsavedChanges = createSelector(
  [getCurrentPath, getUnsavedNodes],
  (currentPath, unsavedNodes) => {
    let node: UnsavedChangesNode | undefined = unsavedNodes;
    for (const part of currentPath) {
      if (typeof node !== 'object') {
        return false;
      }

      node = node?.[part];
    }

    if (node === true) {
      return true;
    }

    return false;
  }
);
