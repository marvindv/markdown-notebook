import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';
import { changeNodeName, moveNode } from 'src/features/nodes/nodesSlice';
import { Path } from 'src/models/node';

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
  initialState: fromLocalStorage() || [],
  reducers: {
    changeCurrentPath(_, action: PayloadAction<Path>) {
      intoLocalStorage(action.payload);
      return action.payload;
    },
  },
  extraReducers: builder => {
    // Whenever the api changes, i.e. on a new login, reset the current path.
    builder.addCase(changeCurrentApi, () => {
      intoLocalStorage([]);
      return [];
    });

    // Update the current path if the title of one of the components changed.
    builder.addCase(changeNodeName.fulfilled, (state, { payload }) => {
      const { oldPath, newName } = payload;

      for (let i = 0; i < oldPath.length; i++) {
        if (oldPath[i] !== state[i]) {
          // Current path and path of the changed node do not match, so nothing to do.
          return;
        }
      }

      state[oldPath.length - 1] = newName;
      intoLocalStorage(state);
    });

    builder.addCase(moveNode.fulfilled, (state, { payload }) => {
      const { oldPath, newPath } = payload;

      if (!oldPath.every((p, i) => state[i] === p)) {
        // The current path does not start with the now moved path, so nothing
        // to do.
        return;
      }

      // Replace the old path with the new path. Keep everything after the
      // changed path.
      const rest = state.slice(oldPath.length);
      const newState = [...newPath, ...rest];

      intoLocalStorage(newState);
      return newState;
    });
  },
});

export const { changeCurrentPath } = currentPathSlice.actions;

export default currentPathSlice.reducer;
