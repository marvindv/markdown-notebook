import { combineReducers } from '@reduxjs/toolkit';

import notebooksReducer from 'features/notebooks/notebooksSlice';
import currentPathReducer from 'features/path/currentPathSlice';

const rootReducer = combineReducers({
  notebooks: notebooksReducer,
  currentPath: currentPathReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
