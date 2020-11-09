import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Path } from 'src/models/node';
import { createEmptyTree, setTreeNodePayload, Tree } from 'src/models/tree';

interface State {
  isFocusNodePendingTree: Tree<true>;
  highlightedNodeTree: Tree<true>;
}

const initialState: State = {
  isFocusNodePendingTree: createEmptyTree(),
  highlightedNodeTree: createEmptyTree(),
};

const nodeFocusSlice = createSlice({
  name: 'nodeFocus',
  initialState,
  reducers: {
    requestNodeFocus(state, action: PayloadAction<{ path: Path }>) {
      const { path } = action.payload;
      setTreeNodePayload(state.isFocusNodePendingTree, path, true);
    },

    resetNodeFocus(state, action: PayloadAction<{ path: Path }>) {
      const { path } = action.payload;
      setTreeNodePayload(state.isFocusNodePendingTree, path, false);
    },

    highlightNode(
      state,
      action: PayloadAction<{ path: Path; isHighlighted: boolean }>
    ) {
      const { path, isHighlighted } = action.payload;
      setTreeNodePayload(state.highlightedNodeTree, path, isHighlighted);
    },
  },
});

export const flashNode = createAsyncThunk(
  'nodeFocus/flashNode',
  async (payload: { path: Path; timeout?: number }, thunkApi) => {
    const { dispatch } = thunkApi;
    dispatch(
      nodeFocusSlice.actions.highlightNode({
        path: payload.path,
        isHighlighted: true,
      })
    );

    setTimeout(() => {
      dispatch(
        nodeFocusSlice.actions.highlightNode({
          path: payload.path,
          isHighlighted: false,
        })
      );
    }, payload.timeout || 1000);
  }
);

export const {
  requestNodeFocus,
  highlightNode,
  resetNodeFocus,
} = nodeFocusSlice.actions;

export default nodeFocusSlice.reducer;
