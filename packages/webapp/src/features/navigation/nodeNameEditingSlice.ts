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

export type NodeNameEditingTree = Tree<true>;
export type NodeNameEditingTreeNode = Tree<true>;

/**
 * Encapsulates the state describing for which nodes their name is currently
 * edited.
 */
const nodeNameEditingSlice = createSlice({
  name: 'nodeNameEditing',
  initialState: createEmptyTree<true>(),
  reducers: {
    /**
     * Sets the editing state of the node associated to the given path.
     *
     * @param {*} state
     * @param {PayloadAction<{ path: Path; isEditing: boolean }>} action
     */
    setNodeEditing(
      state,
      action: PayloadAction<{ path: Path; isEditing: boolean }>
    ) {
      const { path, isEditing } = action.payload;
      if (isEditing) {
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

export const { setNodeEditing } = nodeNameEditingSlice.actions;

export default nodeNameEditingSlice.reducer;
