import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeEntityTitle } from 'src/features/notebooks/notebooksSlice';
import Path from 'src/models/path';

const currentPathSlice = createSlice({
  name: 'currentPath',
  initialState: {} as Path,
  reducers: {
    changeCurrentPath(_, action: PayloadAction<Path>) {
      return action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(changeEntityTitle.fulfilled, (state, { payload }) => {
      const { oldPath, newTitle } = payload;

      if (
        oldPath.pageTitle &&
        oldPath.notebookTitle === state.notebookTitle &&
        oldPath.sectionTitle === state.sectionTitle &&
        oldPath.pageTitle === state.pageTitle
      ) {
        state.pageTitle = newTitle;
      } else if (
        oldPath.sectionTitle &&
        oldPath.notebookTitle === state.notebookTitle &&
        oldPath.sectionTitle === state.sectionTitle
      ) {
        state.sectionTitle = newTitle;
      } else if (
        oldPath.notebookTitle &&
        oldPath.notebookTitle === state.notebookTitle
      ) {
        state.notebookTitle = newTitle;
      }
    });
  },
});

export const { changeCurrentPath } = currentPathSlice.actions;

export default currentPathSlice.reducer;
