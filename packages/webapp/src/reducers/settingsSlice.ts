import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface State {
  theme: 'light' | 'dark';
  rulers: number[];
  wordWrap: boolean;
}

const LOCAL_STORAGE_KEY = '_markdown_notebook_settings';

function fromLocalStorage(): State | null {
  const state = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!state) {
    return null;
  }

  return JSON.parse(state);
}

function intoLocalStorage(state: State) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState:
    fromLocalStorage() ||
    ({
      theme: 'light',
      rulers: [80],
      wordWrap: true,
    } as State),
  reducers: {
    setRulers(state, action: PayloadAction<number[]>) {
      state.rulers = action.payload;
      intoLocalStorage(state);
    },

    setWordWrap(state, action: PayloadAction<boolean>) {
      state.wordWrap = action.payload;
      intoLocalStorage(state);
    },

    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      intoLocalStorage(state);
    },
  },
});

export const { setRulers, setWordWrap, setTheme } = settingsSlice.actions;

export default settingsSlice.reducer;
