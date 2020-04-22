import { combineReducers } from '@reduxjs/toolkit';
import notebooksReducer from 'features/notebooks/notebooksSlice';
import titleEditingReducer from 'features/notebooks/titleEditingSlice';
import currentPathReducer from 'features/path/currentPathSlice';

const rootReducer = combineReducers({
  notebooks: notebooksReducer,
  titleEditing: titleEditingReducer,
  currentPath: currentPathReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
