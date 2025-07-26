// Electron-specific database implementation using better-sqlite3
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder } from '../types';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getNotes: () => Promise<Note[]>;
      getFolders: () => Promise<Folder[]>;
      createNote: (note: Note) => Promise<Note>;
      updateNote: (noteId: string, updates: Partial<Note>) => Promise<{ success: boolean }>;
      deleteNote: (noteId: string) => Promise<{ success: boolean }>;
      createFolder: (folder: Folder) => Promise<Folder>;
      deleteFolder: (folderId: string) => Promise<{ success: boolean }>;
      importData: (notes: Note[], folders: Folder[]) => Promise<{ success: boolean }>;
      saveFile: (defaultPath: string, filters: any[], data: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>;
      openFile: (filters: any[]) => Promise<{ success: boolean; data?: string; canceled?: boolean }>;
    };
  }
}

class ElectronDatabase {
  async getNotes(): Promise<Note[]> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    return window.electronAPI.getNotes();
  }

  async getFolders(): Promise<Folder[]> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    return window.electronAPI.getFolders();
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return window.electronAPI.createNote(newNote);
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const result = await window.electronAPI.updateNote(noteId, updates);
    if (!result.success) {
      throw new Error('Failed to update note');
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const result = await window.electronAPI.deleteNote(noteId);
    if (!result.success) {
      throw new Error('Failed to delete note');
    }
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const newFolder: Folder = {
      ...folder,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    return window.electronAPI.createFolder(newFolder);
  }

  async deleteFolder(folderId: string): Promise<void> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const result = await window.electronAPI.deleteFolder(folderId);
    if (!result.success) {
      throw new Error('Failed to delete folder');
    }
  }

  async importData(notes: Note[], folders: Folder[]): Promise<{ notesImported: number; foldersImported: number }> {
    if (!window.electronAPI) throw new Error('Electron API not available');
    
    const result = await window.electronAPI.importData(notes, folders);
    if (!result.success) {
      throw new Error('Failed to import data');
    }

    return {
      notesImported: notes.length,
      foldersImported: folders.length
    };
  }
}

export const electronDatabase = new ElectronDatabase();
export const isElectron = () => window.electronAPI?.isElectron === true;