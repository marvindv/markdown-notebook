import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import NotebooksPage from 'features/notebooks/NotebooksPage';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import LoginPage from 'features/api/LoginPage';

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
