import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from 'src/features/api/apiSlice';
import currentPathReducer from 'src/features/navigation/currentPathSlice';
import navigationWidthReducer from 'src/features/navigation/navigationWidthSlice';
import nodeNameEditingReducer from 'src/features/navigation/nodeNameEditingSlice';
import nodesReducer from 'src/features/nodes/nodesSlice';
import settingsReducer from 'src/reducers/settingsSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  nodes: nodesReducer,
  navigationWidth: navigationWidthReducer,
  nodeNameEditing: nodeNameEditingReducer,
  currentPath: currentPathReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
