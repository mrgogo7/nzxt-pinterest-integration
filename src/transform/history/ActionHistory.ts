/**
 * ActionHistory.ts
 * 
 * Action history management for TransformEngine v1.
 * 
 * This module provides a command pattern-based undo/redo system for
 * tracking and reverting transform operations (move, resize, rotate).
 * 
 * Design Decisions:
 * - Maximum history size: 50 actions (prevents memory issues)
 * - Actions are stored as commands (can be executed/undone)
 * - History is cleared when new action is performed after undo
 * - State snapshots are lightweight (only element changes)
 */

/**
 * Action type for transform operations.
 */
export type ActionType = 'move' | 'resize' | 'rotate' | 'multi';

/**
 * Base command interface.
 * All transform commands must implement this interface.
 */
export interface Command {
  /** Execute the command (redo) */
  execute(): void;
  /** Undo the command */
  undo(): void;
  /** Action type for grouping */
  type: ActionType;
  /** Timestamp when action was performed */
  timestamp: number;
}

/**
 * Action history manager.
 * 
 * Manages undo/redo stack with maximum size limit.
 */
export class ActionHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number = 50;

  /**
   * Records a new action (command).
   * 
   * When a new action is recorded after undo operations,
   * the redo stack is cleared (standard undo/redo behavior).
   * 
   * @param command - Command to record
   */
  record(command: Command): void {
    // Clear redo stack when new action is performed
    if (this.redoStack.length > 0) {
      this.redoStack = [];
    }

    // Add to undo stack
    this.undoStack.push(command);

    // Limit history size (remove oldest if exceeded)
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo the last action.
   * 
   * @returns True if undo was successful, false if no actions to undo
   */
  undo(): boolean {
    if (this.undoStack.length === 0) {
      return false;
    }

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    return true;
  }

  /**
   * Redo the last undone action.
   * 
   * @returns True if redo was successful, false if no actions to redo
   */
  redo(): boolean {
    if (this.redoStack.length === 0) {
      return false;
    }

    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);

    return true;
  }

  /**
   * Checks if undo is available.
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Checks if redo is available.
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clears all history.
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Gets the number of actions in undo stack.
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Gets the number of actions in redo stack.
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Sets the maximum history size.
   * 
   * @param size - Maximum number of actions to keep in history
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    
    // Trim undo stack if it exceeds new max size
    if (this.undoStack.length > size) {
      this.undoStack = this.undoStack.slice(-size);
    }
  }
}

