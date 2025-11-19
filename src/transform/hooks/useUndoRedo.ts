/**
 * useUndoRedo.ts
 * 
 * React hook for undo/redo functionality.
 * 
 * This hook provides undo/redo capabilities for transform operations
 * using the ActionHistory system.
 * 
 * It integrates with keyboard shortcuts (Ctrl+Z / Ctrl+Y) and provides
 * state management for undo/redo buttons.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ActionHistory } from '../history/ActionHistory';
import type { Command } from '../history/ActionHistory';

/**
 * Undo/Redo hook configuration.
 */
export interface UseUndoRedoConfig {
  /** Maximum history size (default: 50) */
  maxHistorySize?: number;
  /** Enable keyboard shortcuts (default: true) */
  enableKeyboardShortcuts?: boolean;
}

/**
 * Undo/Redo hook return value.
 */
export interface UseUndoRedoReturn {
  /** Can undo */
  canUndo: boolean;
  /** Can redo */
  canRedo: boolean;
  /** Undo count */
  undoCount: number;
  /** Redo count */
  redoCount: number;
  /** Undo function */
  undo: () => void;
  /** Redo function */
  redo: () => void;
  /** Record a command */
  record: (command: Command) => void;
  /** Clear history */
  clear: () => void;
}

/**
 * Hook for managing undo/redo functionality.
 * 
 * @param config - Configuration options
 * @returns Undo/redo interface
 */
export function useUndoRedo(
  config: UseUndoRedoConfig = {}
): UseUndoRedoReturn {
  const {
    maxHistorySize = 50,
    enableKeyboardShortcuts = true,
  } = config;

  // Create action history instance (persists across re-renders)
  const historyRef = useRef<ActionHistory | null>(null);
  if (!historyRef.current) {
    historyRef.current = new ActionHistory();
    // Set max history size
    historyRef.current.setMaxHistorySize(maxHistorySize);
  }

  const history = historyRef.current;

  // State for UI updates
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  /**
   * Updates UI state from history.
   */
  const updateState = useCallback(() => {
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
    setUndoCount(history.getUndoCount());
    setRedoCount(history.getRedoCount());
  }, [history]);

  /**
   * Records a command.
   */
  const record = useCallback((command: Command) => {
    history.record(command);
    updateState();
  }, [history, updateState]);

  /**
   * Undo function.
   */
  const undo = useCallback(() => {
    if (history.undo()) {
      updateState();
    }
  }, [history, updateState]);

  /**
   * Redo function.
   */
  const redo = useCallback(() => {
    if (history.redo()) {
      updateState();
    }
  }, [history, updateState]);

  /**
   * Clear history.
   */
  const clear = useCallback(() => {
    history.clear();
    updateState();
  }, [history, updateState]);

  /**
   * Keyboard shortcuts handler.
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z (Mac) for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z (Mac) for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardShortcuts, undo, redo]);

  // Initial state update
  useEffect(() => {
    updateState();
  }, [updateState]);

  return {
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    undo,
    redo,
    record,
    clear,
  };
}

