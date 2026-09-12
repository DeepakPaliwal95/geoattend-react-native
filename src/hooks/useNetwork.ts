import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface UseNetworkReturn {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

/**
 * Custom hook to monitor device network and internet connectivity in real-time.
 * Determines if the user is offline (e.g. airplane mode, wifi/cellular toggled off).
 */
export const useNetwork = (): UseNetworkReturn => {
  const [networkState, setNetworkState] = useState<{
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
  }>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Initial fetch to populate state immediately
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Real-time listener triggered whenever user toggles Wi-Fi/Data or goes offline
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Offline if disconnected or if internet is not reachable
  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  return {
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    isOffline,
  };
};
