import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Api from './api';
import LocalStorageApi from './localStorage.api';
import ServerApi from './server.api';

export type ApiId = 'localStorage' | 'server';

export interface State {
  current: ApiId | null;
}

export const apis: { [id in ApiId]: Api } = {
  localStorage: new LocalStorageApi(),
  server: new ServerApi(),
};

let currentApi: Api | null;

/**
 * Gets the currently used api.
 *
 * @export
 * @returns {(Api | null)}
 */
export function getApi(): Api | null {
  return currentApi;
}

// Tries to load the selected api from the localStorage.
let initialApiId = localStorage.getItem('_markdown_notebook_current_api');
if (initialApiId && apis.hasOwnProperty(initialApiId)) {
  const initialApi = apis[initialApiId as ApiId];
  // Make sure that the selected api is still in a valid state. If not remove
  // it from localStorage.
  if (initialApi.isValid()) {
    currentApi = initialApi;
  } else {
    localStorage.removeItem('_markdown_notebook_current_api');
  }
} else {
  initialApiId = null;
}

const apiSlice = createSlice({
  name: 'api',
  initialState: { current: initialApiId } as State,
  reducers: {
    changeCurrentApi(state, action: PayloadAction<ApiId | null>) {
      if (state.current === action.payload) {
        return;
      }

      // Logout from current api.
      if (state.current) {
        const currentApi = apis[state.current];
        currentApi.logout();
      }

      state.current = action.payload;
      currentApi = action.payload ? apis[action.payload] : null;
      if (action.payload) {
        localStorage.setItem('_markdown_notebook_current_api', action.payload);
      } else {
        localStorage.removeItem('_markdown_notebook_current_api');
      }
    },
  },
});

export const { changeCurrentApi } = apiSlice.actions;

export default apiSlice.reducer;
