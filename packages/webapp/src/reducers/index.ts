import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from 'src/features/api/apiSlice';
import currentPathReducer from 'src/features/navigation/currentPathSlice';
import nodeNameEditingReducer from 'src/features/navigation/nodeNameEditingSlice';
import nodesReducer from 'src/features/nodes/nodesSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  nodes: nodesReducer,
  nodeNameEditing: nodeNameEditingReducer,
  currentPath: currentPathReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
