import { addNetworkStateListener, type NetworkStateEvent } from 'expo-network';

export function subscribeToConnectivity(onChange: (state: NetworkStateEvent) => void) {
  const sub = addNetworkStateListener(onChange);
  return () => sub.remove();
}
