import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';
import { changeEntityTitle } from 'src/features/notebooks/notebooksSlice';
import Path from 'src/models/path';

const PATH_LOCAL_STORAGE_KEY = '_markdown_notebook_current_path';

/**
 * Loads the current path from the localStorage or returns null if there is none
 * saved.
 *
 * @returns {(Path | null)}
 */
function fromLocalStorage(): Path | null {
  const state = localStorage.getItem(PATH_LOCAL_STORAGE_KEY);
  if (!state) {
    return null;
  }

  return JSON.parse(state);
}

/**
 * Saves the given path into the localStorage to be loaded with
 * {@link fromLocalStorage}.
 *
 * @param {Path} path
 */
function intoLocalStorage(path: Path) {
  localStorage.setItem(PATH_LOCAL_STORAGE_KEY, JSON.stringify(path));
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
    // Whenever the api changes, i.e. on a new login, reset the current path.
    builder.addCase(changeCurrentApi, () => {
      intoLocalStorage({});
      return {};
    });

    // Update the current path if the title of one of the components changed.
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
