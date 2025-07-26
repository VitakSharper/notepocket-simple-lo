// Simplified database adapter that starts with memory and allows upgrading
import { Note, Folder } from '../types';
import * as fallbackDB from './fallback';
import * as sqliteDB from './localSqlite';

class SimplifiedDatabaseAdapter {
  private usingSqlite = false;
  private initialized = false;

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      // Always start with fallback (memory) database for immediate functionality
      console.log('Initializing with memory database for quick start...');
      await fallbackDB.initializeDatabase();
      this.usingSqlite = false;
      this.initialized = true;
      console.log('Memory database ready');
    } catch (error) {
      console.error('Failed to initialize memory database:', error);
      throw error;
    }
  }

  // Method to upgrade to SQLite file storage
  async upgradeToSqlite(): Promise<void> {
    if (this.usingSqlite) return;

    try {
      console.log('Upgrading to SQLite file storage...');
      
      // Get current data from memory database
      const currentNotes = this.getAllNotes();
      const currentFolders = this.getAllFolders();
      
      // Initialize SQLite
      await sqliteDB.initializeDatabase();
      
      // Migrate data to SQLite
      for (const folder of currentFolders) {
        await sqliteDB.createFolder({
          name: folder.name,
          color: folder.color
        });
      }
      
      for (const note of currentNotes) {
        await sqliteDB.createNote({
          title: note.title,
          content: note.content,
          type: note.type,
          folderId: note.folderId,
          tags: note.tags,
          isFavorite: note.isFavorite,
          imageUrl: note.imageUrl,
          fileName: note.fileName,
          fileSize: note.fileSize,
          fileType: note.fileType
        });
      }
      
      this.usingSqlite = true;
      console.log('Successfully upgraded to SQLite file storage');
    } catch (error) {
      console.error('Failed to upgrade to SQLite:', error);
      throw error;
    }
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
const dbAdapter = new SimplifiedDatabaseAdapter();

// Export adapter methods
export async function initializeDatabase(): Promise<void> {
  return dbAdapter.initializeDatabase();
}

export async function upgradeToSqlite(): Promise<void> {
  return dbAdapter.upgradeToSqlite();
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