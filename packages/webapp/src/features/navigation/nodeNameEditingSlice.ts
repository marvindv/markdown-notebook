import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';
import { changeNodeName } from 'src/features/nodes/nodesSlice';
import {
  changeTreeNodeName,
  NodeTree,
  NodeTreeNode,
  removePathFromTree,
  setLeafValue,
} from 'src/features/nodes/NodeTree';
import { Path } from 'src/models/node';

export type NodeNameEditingTree = NodeTree<true>;
export type NodeNameEditingTreeNode = NodeTreeNode<true>;

/**
 * Encapsulates the state describing for which nodes their name is currently
 * edited.
 */
const nodeNameEditingSlice = createSlice({
  name: 'nodeNameEditing',
  initialState: {} as NodeNameEditingTree,
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
        setLeafValue(state, path, true);
      } else {
        removePathFromTree(state, path);
      }
    },
  },
  extraReducers: builder => {
    // Reset whenever the api is changed.
    builder.addCase(changeCurrentApi, () => {
      return {};
    });

    builder.addCase(changeNodeName.fulfilled, (state, { payload }) => {
      changeTreeNodeName(state, payload.oldPath, payload.newName);
    });
  },
});

export const { setNodeEditing } = nodeNameEditingSlice.actions;

export default nodeNameEditingSlice.reducer;
