/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  jest.useFakeTimers();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer).toBeDefined();

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(2500);
  });

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });

  jest.useRealTimers();
});
