import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';

import 'core-js/modules/es.promise.all-settled';

import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import THEME from './theme';
import GlobalStyle from './style';
import store from 'store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={THEME}>
        <GlobalStyle theme={THEME} />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
