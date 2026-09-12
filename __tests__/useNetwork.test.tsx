import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import NetInfo from '@react-native-community/netinfo';
import { useNetwork, UseNetworkReturn } from '../src/hooks/useNetwork';

describe('useNetwork hook', () => {
  let hookValue: UseNetworkReturn;

  function TestComponent() {
    hookValue = useNetwork();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with online state when connected and reachable', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<TestComponent />);
    });

    expect(hookValue.isConnected).toBe(true);
    expect(hookValue.isInternetReachable).toBe(true);
    expect(hookValue.isOffline).toBe(false);
  });

  it('detects offline state when isConnected is false', async () => {
    let listener: (state: any) => void = () => {};
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return jest.fn();
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<TestComponent />);
    });

    await ReactTestRenderer.act(async () => {
      listener({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });
    });

    expect(hookValue.isConnected).toBe(false);
    expect(hookValue.isOffline).toBe(true);
  });

  it('detects offline state when isInternetReachable is false even if connected to wifi with no internet', async () => {
    let listener: (state: any) => void = () => {};
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return jest.fn();
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<TestComponent />);
    });

    await ReactTestRenderer.act(async () => {
      listener({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
      });
    });

    expect(hookValue.isConnected).toBe(true);
    expect(hookValue.isInternetReachable).toBe(false);
    expect(hookValue.isOffline).toBe(true);
  });
});
