import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import LoginPage from 'src/features/api/LoginPage';
import NotebookPage from 'src/features/nodes/NotebookPage';
import { RootState } from 'src/reducers';

export default function App() {
  const currentApi = useSelector((state: RootState) => state.api.current);

  return (
    <Switch>
      <Route path='/login'>
        <LoginPage />
      </Route>

      <Route path='/'>
        {currentApi ? (
          <NotebookPage />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )}
      </Route>
    </Switch>
  );
}
