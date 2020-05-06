import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import LoginPage from 'src/features/api/LoginPage';
import NotebooksPage from 'src/features/notebooks/NotebooksPage';
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
          <NotebooksPage />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )}
      </Route>
    </Switch>
  );
}
