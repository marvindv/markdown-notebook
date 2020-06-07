import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface State {
  rulers: number[];
  wordWrap: boolean;
}

const LOCAL_STORAGE_KEY = '_markdown_notebook_editor_settings';

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

const editorSettingsSlice = createSlice({
  name: 'editorSettings',
  initialState:
    fromLocalStorage() ||
    ({
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
  },
});

export const { setRulers, setWordWrap } = editorSettingsSlice.actions;

export default editorSettingsSlice.reducer;
