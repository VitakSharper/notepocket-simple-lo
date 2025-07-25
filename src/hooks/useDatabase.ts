import { useState, useEffect, useCallback } from 'react';
import { Note, Folder } from '../lib/types';
import { db } from '../lib/database';
import { MigrationService } from '../lib/migration';
import { toast } from 'sonner';

/**
 * React hook for database operations
 * Provides CRUD operations with automatic state synchronization
 */
export function useDatabase() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load initial data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.init();
        
        // Check for and run migration if needed
        const migrationNeeded = await MigrationService.checkMigrationNeeded();
        if (migrationNeeded) {
          const result = await MigrationService.migrateFromKV();
          if (result.success && (result.notesCount > 0 || result.foldersCount > 0)) {
            toast.success(`Migrated ${result.notesCount} notes and ${result.foldersCount} folders to new database!`);
          }
        }
        
        await loadData();
      } catch (err) {
        setError('Failed to initialize database');
        console.error('Database initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const loadData = async () => {
    try {
      const [notesData, foldersData] = await Promise.all([
        db.getAllNotes(),
        db.getAllFolders(),
      ]);
      
      setNotes(notesData);
      setFolders(foldersData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    }
  };

  // Note operations
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNote = await db.createNote(note);
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await db.updateNote(id, updates);
      if (updatedNote) {
        setNotes(prev => prev.map(note => 
          note.id === id ? updatedNote : note
        ));
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to update note');
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const success = await db.deleteNote(id);
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id));
      }
      return success;
    } catch (err) {
      setError('Failed to delete note');
      throw err;
    }
  }, []);

  const getNoteById = useCallback(async (id: string) => {
    try {
      return await db.getNoteById(id);
    } catch (err) {
      setError('Failed to get note');
      throw err;
    }
  }, []);

  // Folder operations
  const createFolder = useCallback(async (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    try {
      const newFolder = await db.createFolder(folder);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError('Failed to create folder');
      throw err;
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      const success = await db.deleteFolder(id);
      if (success) {
        setFolders(prev => prev.filter(folder => folder.id !== id));
        // Update notes that were in this folder
        setNotes(prev => prev.map(note => 
          note.folderId === id ? { ...note, folderId: undefined } : note
        ));
      }
      return success;
    } catch (err) {
      setError('Failed to delete folder');
      throw err;
    }
  }, []);

  // Search and filter operations
  const searchNotes = useCallback(async (query: string) => {
    try {
      return await db.searchNotes(query);
    } catch (err) {
      setError('Failed to search notes');
      throw err;
    }
  }, []);

  const getNotesByType = useCallback(async (type: Note['type']) => {
    try {
      return await db.getNotesByType(type);
    } catch (err) {
      setError('Failed to get notes by type');
      throw err;
    }
  }, []);

  const getNotesByFolder = useCallback(async (folderId: string) => {
    try {
      return await db.getNotesByFolder(folderId);
    } catch (err) {
      setError('Failed to get notes by folder');
      throw err;
    }
  }, []);

  const getFavoriteNotes = useCallback(async () => {
    try {
      return await db.getFavoriteNotes();
    } catch (err) {
      setError('Failed to get favorite notes');
      throw err;
    }
  }, []);

  // File operations
  const storeFile = useCallback(async (noteId: string, file: File) => {
    try {
      return await db.storeFile(noteId, file);
    } catch (err) {
      setError('Failed to store file');
      throw err;
    }
  }, []);

  const getFile = useCallback(async (fileId: string) => {
    try {
      return await db.getFile(fileId);
    } catch (err) {
      setError('Failed to get file');
      throw err;
    }
  }, []);

  // Database maintenance
  const clearDatabase = useCallback(async () => {
    try {
      await db.clearDatabase();
      setNotes([]);
      setFolders([]);
    } catch (err) {
      setError('Failed to clear database');
      throw err;
    }
  }, []);

  const getDatabaseSize = useCallback(async () => {
    try {
      return await db.getDatabaseSize();
    } catch (err) {
      setError('Failed to get database size');
      throw err;
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await loadData();
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    notes,
    folders,
    isLoading,
    error,
    
    // Note operations
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    
    // Folder operations
    createFolder,
    deleteFolder,
    
    // Search operations
    searchNotes,
    getNotesByType,
    getNotesByFolder,
    getFavoriteNotes,
    
    // File operations
    storeFile,
    getFile,
    
    // Database maintenance
    clearDatabase,
    getDatabaseSize,
    refreshData,
    clearError,
  };
}