// Lightweight Zustand-like implementation
import { useEffect, useState, useCallback, useRef } from 'react';

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;
type Subscribe<T> = (listener: (state: T) => void) => () => void;

interface StoreApi<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: Subscribe<T>;
}

export function create<T>(
  createState: (set: SetState<T>, get: GetState<T>) => T
): () => T & { getState: () => T } {
  let state: T;
  const listeners = new Set<(state: T) => void>();

  const setState: SetState<T> = (partial) => {
    const nextState = typeof partial === 'function' 
      ? { ...state, ...(partial as Function)(state) }
      : { ...state, ...partial };
    
    if (!Object.is(nextState, state)) {
      state = nextState;
      listeners.forEach((listener) => listener(state));
    }
  };

  const getState: GetState<T> = () => state;

  const subscribe: Subscribe<T> = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setState, getState, subscribe };
  state = createState(setState, getState);

  const useStore = () => {
    const [, forceUpdate] = useState(0);
    
    useEffect(() => {
      return subscribe(() => forceUpdate((n) => n + 1));
    }, []);
    
    return state;
  };

  // Add getState to the hook for external access
  (useStore as any).getState = getState;
  
  return useStore as () => T & { getState: () => T };
}
