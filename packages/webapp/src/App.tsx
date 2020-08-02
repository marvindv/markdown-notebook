import React from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import LoginPage from 'src/features/api/LoginPage';
import NotebookPage from 'src/features/nodes/NotebookPage';
import { RootState } from 'src/reducers';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './style';
import { darkTheme, lightTheme } from './theme';

export default function App() {
  const currentApi = useSelector((state: RootState) => state.api.current);
  const currentTheme = useSelector((state: RootState) => state.settings.theme);

  return (
    <ThemeProvider theme={currentTheme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyle />

      <ToastContainer
        position='top-right'
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Router>
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
      </Router>
    </ThemeProvider>
  );
}
