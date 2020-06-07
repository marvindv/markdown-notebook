import 'core-js/modules/es.promise.all-settled';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { ThemeProvider } from 'styled-components';
import App from './App';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import store from './store';
import GlobalStyle from './style';
import THEME from './theme';

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <ThemeProvider theme={THEME}>
          <GlobalStyle theme={THEME} />

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
            <App />
          </Router>
        </ThemeProvider>
      </Provider>
    </DndProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
