import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';
import { changeNodeName } from 'src/features/nodes/nodesSlice';
import { Path } from 'src/models/node';
import {
  changeTreeNodeName,
  createEmptyTree,
  setTreeNodePayload,
} from 'src/models/tree';
import { ExpandedNodesTree } from './FileTree';

const EXPANDED_NODES_STORAGE_KEY = '_markdown_notebook_expanded_nodes';

function fromLocalStorage(): ExpandedNodesTree | null {
  const state = localStorage.getItem(EXPANDED_NODES_STORAGE_KEY);
  if (!state) {
    return null;
  }

  return JSON.parse(state);
}

function intoLocalStorage(tree: ExpandedNodesTree) {
  localStorage.setItem(EXPANDED_NODES_STORAGE_KEY, JSON.stringify(tree));
}

const expandedNodesSlice = createSlice({
  name: 'expandedNodes',
  initialState: fromLocalStorage() || createEmptyTree<true>(),
  reducers: {
    /**
     * Sets the expanded state for the given node.
     */
    setIsNodeExpanded(
      state,
      action: PayloadAction<{ path: Path; isExpanded: boolean }>
    ) {
      const { path, isExpanded } = action.payload;
      const payload = isExpanded ? true : undefined;

      setTreeNodePayload(state, path, payload);
      intoLocalStorage(state);
    },

    /**
     * Sets the expanded state for each node in the given path.
     */
    recursivlySetIsNodeExpanded(
      state,
      action: PayloadAction<{ path: Path; isExpanded: boolean }>
    ) {
      const { path, isExpanded } = action.payload;
      const payload = isExpanded ? true : undefined;

      for (let i = 0; i < path.length; i++) {
        setTreeNodePayload(state, path.slice(0, i + 1), payload);
      }

      intoLocalStorage(state);
    },
  },
  extraReducers: builder => {
    // Reset whenever the api is changed.
    builder.addCase(changeCurrentApi, () => {
      const state: ExpandedNodesTree = createEmptyTree();
      intoLocalStorage(state);
      return state;
    });

    builder.addCase(changeNodeName.fulfilled, (state, { payload }) => {
      changeTreeNodeName(state, payload.oldPath, payload.newName);
      intoLocalStorage(state);
    });
  },
});

export const {
  setIsNodeExpanded,
  recursivlySetIsNodeExpanded,
} = expandedNodesSlice.actions;

export default expandedNodesSlice.reducer;
