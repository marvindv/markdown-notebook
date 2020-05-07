import { render } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders the App component', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeTruthy();
});
