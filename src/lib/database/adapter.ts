import { Note, Folder } from '../types';

// Import both implementations
import * as fallbackDB from './fallback';
import * as sqliteDB from './localSqlite';

// Database adapter that tries SQLite first, falls back to in-memory
class DatabaseAdapter {
  private usingSqlite = false;
  private initialized = false;

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try SQLite first
      await sqliteDB.initializeDatabase();
      this.usingSqlite = true;
      console.log('Using SQLite database');
    } catch (error) {
      console.warn('SQLite failed, falling back to in-memory database:', error);
      // Fallback to in-memory database (never throws)
      await fallbackDB.initializeDatabase();
      this.usingSqlite = false;
      console.log('Using fallback in-memory database');
    }

    this.initialized = true;
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    return this.usingSqlite 
      ? sqliteDB.createNote(note)
      : fallbackDB.createNote(note);
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    return this.usingSqlite 
      ? sqliteDB.updateNote(id, updates)
      : fallbackDB.updateNote(id, updates);
  }

  async deleteNote(id: string): Promise<void> {
    return this.usingSqlite 
      ? sqliteDB.deleteNote(id)
      : fallbackDB.deleteNote(id);
  }

  getAllNotes(): Note[] {
    return this.usingSqlite 
      ? sqliteDB.getAllNotes()
      : fallbackDB.getAllNotes();
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    return this.usingSqlite 
      ? sqliteDB.createFolder(folder)
      : fallbackDB.createFolder(folder);
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    return this.usingSqlite 
      ? sqliteDB.updateFolder(id, updates)
      : fallbackDB.updateFolder(id, updates);
  }

  async deleteFolder(id: string): Promise<void> {
    return this.usingSqlite 
      ? sqliteDB.deleteFolder(id)
      : fallbackDB.deleteFolder(id);
  }

  getAllFolders(): Folder[] {
    return this.usingSqlite 
      ? sqliteDB.getAllFolders()
      : fallbackDB.getAllFolders();
  }

  closeDatabase(): void {
    return this.usingSqlite 
      ? sqliteDB.closeDatabase()
      : fallbackDB.closeDatabase();
  }

  async forceSaveDatabase(): Promise<void> {
    return this.usingSqlite 
      ? sqliteDB.forceSaveDatabase()
      : fallbackDB.forceSaveDatabase();
  }

  getStatus(): { usingSqlite: boolean; initialized: boolean } {
    return {
      usingSqlite: this.usingSqlite,
      initialized: this.initialized
    };
  }
}

// Create singleton instance
const dbAdapter = new DatabaseAdapter();

// Export adapter methods
export async function initializeDatabase(): Promise<void> {
  return dbAdapter.initializeDatabase();
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  return dbAdapter.createNote(note);
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  return dbAdapter.updateNote(id, updates);
}

export async function deleteNote(id: string): Promise<void> {
  return dbAdapter.deleteNote(id);
}

export function getAllNotes(): Note[] {
  return dbAdapter.getAllNotes();
}

export async function createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
  return dbAdapter.createFolder(folder);
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  return dbAdapter.updateFolder(id, updates);
}

export async function deleteFolder(id: string): Promise<void> {
  return dbAdapter.deleteFolder(id);
}

export function getAllFolders(): Folder[] {
  return dbAdapter.getAllFolders();
}

export function closeDatabase(): void {
  return dbAdapter.closeDatabase();
}

export async function forceSaveDatabase(): Promise<void> {
  return dbAdapter.forceSaveDatabase();
}

export function getDatabaseStatus() {
  return dbAdapter.getStatus();
}