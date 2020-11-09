import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from 'src/features/api/apiSlice';
import currentPathReducer from 'src/features/navigation/currentPathSlice';
import expandedNodesReducer from 'src/features/navigation/expandedNodesSlice';
import navigationWidthReducer from 'src/features/navigation/navigationWidthSlice';
import nodeFocusReducer from 'src/features/navigation/nodeFocusSlice';
import nodeNameEditingReducer from 'src/features/navigation/nodeNameEditingSlice';
import nodesReducer from 'src/features/nodes/nodesSlice';
import settingsReducer from 'src/reducers/settingsSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  nodes: nodesReducer,
  navigationWidth: navigationWidthReducer,
  nodeNameEditing: nodeNameEditingReducer,
  expandedNodes: expandedNodesReducer,
  currentPath: currentPathReducer,
  settings: settingsReducer,
  nodeFocus: nodeFocusReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
