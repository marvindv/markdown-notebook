import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from 'src/features/api/apiSlice';
import currentPathReducer from 'src/features/notebooks/currentPathSlice';
import notebooksReducer from 'src/features/notebooks/notebooksSlice';
import titleEditingReducer from 'src/features/notebooks/titleEditingSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  notebooks: notebooksReducer,
  titleEditing: titleEditingReducer,
  currentPath: currentPathReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
