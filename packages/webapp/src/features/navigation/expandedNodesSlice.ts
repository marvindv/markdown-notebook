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
    setIsNodeExpanded(
      state,
      action: PayloadAction<{ path: Path; isExpanded: boolean }>
    ) {
      const { path, isExpanded } = action.payload;
      if (isExpanded) {
        setTreeNodePayload(state, path, true);
      } else {
        setTreeNodePayload(state, path, undefined);
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

export const { setIsNodeExpanded } = expandedNodesSlice.actions;

export default expandedNodesSlice.reducer;
