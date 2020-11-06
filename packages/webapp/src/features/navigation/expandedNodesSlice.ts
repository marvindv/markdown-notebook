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

const initialState: ExpandedNodesTree = createEmptyTree<true>();

const expandedNodesSlice = createSlice({
  name: 'expandedNodes',
  initialState,
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
    },
  },
  extraReducers: builder => {
    // Reset whenever the api is changed.
    builder.addCase(changeCurrentApi, () => {
      return createEmptyTree();
    });

    builder.addCase(changeNodeName.fulfilled, (state, { payload }) => {
      changeTreeNodeName(state, payload.oldPath, payload.newName);
    });
  },
});

export const {
  setIsNodeExpanded,
  recursivlySetIsNodeExpanded,
} = expandedNodesSlice.actions;

export default expandedNodesSlice.reducer;
