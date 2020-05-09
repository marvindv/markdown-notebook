import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeEntityTitle } from 'src/features/notebooks/notebooksSlice';
import Path from 'src/models/path';

const PATH_KEY = '_markdown_notebook_current_path';

function fromLocalStorage(): Path | null {
  const state = localStorage.getItem(PATH_KEY);
  if (!state) {
    return null;
  }

  return JSON.parse(state);
}

function intoLocalStorage(path: Path) {
  localStorage.setItem(PATH_KEY, JSON.stringify(path));
}

const currentPathSlice = createSlice({
  name: 'currentPath',
  initialState: fromLocalStorage() || {},
  reducers: {
    changeCurrentPath(_, action: PayloadAction<Path>) {
      intoLocalStorage(action.payload);
      return action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(changeEntityTitle.fulfilled, (state, { payload }) => {
      const { oldPath, newTitle } = payload;

      if (oldPath.pageTitle) {
        if (
          oldPath.notebookTitle === state.notebookTitle &&
          oldPath.sectionTitle === state.sectionTitle &&
          oldPath.pageTitle === state.pageTitle
        ) {
          state.pageTitle = newTitle;
        }
      } else if (oldPath.sectionTitle) {
        if (
          oldPath.notebookTitle === state.notebookTitle &&
          oldPath.sectionTitle === state.sectionTitle
        ) {
          state.sectionTitle = newTitle;
        }
      } else if (oldPath.notebookTitle) {
        if (oldPath.notebookTitle === state.notebookTitle) {
          state.notebookTitle = newTitle;
        }
      }
    });
  },
});

export const { changeCurrentPath } = currentPathSlice.actions;

export default currentPathSlice.reducer;
