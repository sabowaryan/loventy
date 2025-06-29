// src/hooks/useHistory.ts
import { useState, useCallback } from 'react';

interface HistoryHook<T> {
  current: T;
  history: T[];
  currentIndex: number;
  add: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * A custom hook for managing state with undo/redo capabilities.
 * It maintains a history of states, allowing navigation through them.
 *
 * @param initialValue The initial state value.
 * @returns An object containing the current state, functions to manipulate history,
 *          and flags indicating if undo/redo operations are possible.
 */
export function useHistory<T>(initialValue: T): HistoryHook<T> {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Adds a new state to the history. If the current index is not at the end of the history,
   * it truncates the history from the current index + 1 before adding the new state.
   * This effectively discards any "future" states when a new state is added after an undo.
   *
   * @param newState The new state to add to the history.
   */
  const add = useCallback((newState: T) => {
    setHistory(prevHistory => {
      // If the new state is identical to the current state, do nothing.
      // This prevents unnecessary history entries for no-op changes.
      if (JSON.stringify(prevHistory[currentIndex]) === JSON.stringify(newState)) {
        return prevHistory;
      }

      // Discard any "future" states if we're not at the end of the history
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prevIndex => prevIndex + 1);
  }, [currentIndex]);

  /**
   * Moves the current state back one step in the history.
   * This operation is only possible if `canUndo` is true.
   */
  const undo = useCallback(() => {
    setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
  }, []);

  /**
   * Moves the current state forward one step in the history.
   * This operation is only possible if `canRedo` is true.
   */
  const redo = useCallback(() => {
    setCurrentIndex(prevIndex => Math.min(history.length - 1, prevIndex + 1));
  }, [history.length]);

  // Determine if undo/redo operations are possible
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    current: history[currentIndex],
    history,
    currentIndex,
    add,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

