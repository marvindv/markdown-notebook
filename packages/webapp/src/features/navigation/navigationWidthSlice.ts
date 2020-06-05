import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeCurrentApi } from 'src/features/api/apiSlice';

const LOCAL_STORAGE_KEY = '_markdown_notebook_navigation_width';
const DEFAULT_STATE = 200;

function fromLocalStorage(): number | null {
  const state = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (state) {
    const num = parseInt(state, 10);
    return isNaN(num) ? null : num;
  }

  return null;
}

function intoLocalStorage(width: number) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(width));
}

/**
 * Encapsulates the latest navigation component width.
 */
const navigationWidthSlice = createSlice({
  name: 'navigationWidth',
  initialState: fromLocalStorage() || DEFAULT_STATE,
  reducers: {
    setNavigationWidth(_, action: PayloadAction<{ width: number }>) {
      const { width } = action.payload;
      intoLocalStorage(width);
      return width;
    },
  },
  extraReducers: builder => {
    // Reset whenever the api is changed.
    builder.addCase(changeCurrentApi, () => {
      return DEFAULT_STATE;
    });
  },
});

export const { setNavigationWidth } = navigationWidthSlice.actions;

export default navigationWidthSlice.reducer;
