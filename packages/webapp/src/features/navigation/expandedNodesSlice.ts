import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';
import { changeNodeName } from 'src/features/nodes/nodesSlice';
import { Path } from 'src/models/node';
import {
  changeTreeNodeName,
  createEmptyTree,
  setTreeNodePayload,
  Tree,
} from 'src/models/tree';

/**
 * A tree to store the expanded state of nodes. A node with the payload `true`
 * is be expanded.
 */
export type ExpandedNodesTree = Tree<true>;

const expandedNodesSlice = createSlice({
  name: 'expandedNodes',
  initialState: createEmptyTree<true>(),
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
