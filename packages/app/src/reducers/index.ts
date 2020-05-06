import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from 'features/api/apiSlice';
import notebooksReducer from 'features/notebooks/notebooksSlice';
import titleEditingReducer from 'features/notebooks/titleEditingSlice';
import currentPathReducer from 'features/notebooks/currentPathSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  notebooks: notebooksReducer,
  titleEditing: titleEditingReducer,
  currentPath: currentPathReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
