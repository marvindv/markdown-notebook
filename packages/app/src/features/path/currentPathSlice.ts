import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DUMMY_PATH } from './dummy-data';
import Path from './model';

const currentPathSlice = createSlice({
  name: 'currentPath',
  initialState: DUMMY_PATH as Path,
  reducers: {
    changeCurrentPath(_, action: PayloadAction<Path>) {
      return action.payload;
    },
  },
});

export const { changeCurrentPath } = currentPathSlice.actions;

export default currentPathSlice.reducer;
