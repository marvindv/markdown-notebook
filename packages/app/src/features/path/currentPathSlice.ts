import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Path from 'models/path';

const currentPathSlice = createSlice({
  name: 'currentPath',
  initialState: {} as Path,
  reducers: {
    changeCurrentPath(_, action: PayloadAction<Path>) {
      return action.payload;
    },
  },
});

export const { changeCurrentPath } = currentPathSlice.actions;

export default currentPathSlice.reducer;
