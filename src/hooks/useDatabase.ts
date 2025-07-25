import { useState, useEffect, useCallback } from 'react';
import { Note, Folder } from '../lib/types';
import { databaseService } from '../lib/database/service';

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
        databaseService.getAllNotes(),
        databaseService.getAllFolders(),
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
      const newNote = await databaseService.createNote(note);
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      throw err;
    }
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await databaseService.updateNote(id, updates);
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
      const success = await databaseService.deleteNote(id);
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
      return await databaseService.getNoteById(id);
    } catch (err) {
      setError('Failed to get note');
      throw err;
    }
  }, []);

  // Folder operations
  const createFolder = useCallback(async (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    try {
      const newFolder = await databaseService.createFolder(folder);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError('Failed to create folder');
      throw err;
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      const success = await databaseService.deleteFolder(id);
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
      return await databaseService.searchNotes(query);
    } catch (err) {
      setError('Failed to search notes');
      throw err;
    }
  }, []);

  const getNotesByFolder = useCallback(async (folderId: string) => {
    try {
      return await databaseService.getNotesByFolder(folderId);
    } catch (err) {
      setError('Failed to get notes by folder');
      throw err;
    }
  }, []);

  const getFavoriteNotes = useCallback(async () => {
    try {
      return await databaseService.getFavoriteNotes();
    } catch (err) {
      setError('Failed to get favorite notes');
      throw err;
    }
  }, []);

  // Database maintenance
  const clearDatabase = useCallback(async () => {
    try {
      // Since we don't have a clear method in the service, we'll delete all data
      const allNotes = await databaseService.getAllNotes();
      const allFolders = await databaseService.getAllFolders();
      
      for (const note of allNotes) {
        await databaseService.deleteNote(note.id);
      }
      
      for (const folder of allFolders) {
        await databaseService.deleteFolder(folder.id);
      }
      
      setNotes([]);
      setFolders([]);
    } catch (err) {
      setError('Failed to clear database');
      throw err;
    }
  }, []);

  const getDatabaseSize = useCallback(async () => {
    try {
      const stats = await databaseService.getStats();
      return {
        totalNotes: stats.totalNotes,
        totalFolders: stats.totalFolders,
        favoriteNotes: stats.favoriteNotes,
        notesByType: stats.notesByType,
      };
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

  // Import data from backup
  const importData = useCallback(async (importedNotes: Note[], importedFolders: Folder[]) => {
    try {
      const result = await databaseService.importData(importedNotes, importedFolders);
      
      // Refresh the local state after import
      await loadData();
      
      return { notesCount: result.notes, foldersCount: result.folders };
    } catch (err) {
      setError('Failed to import data');
      throw err;
    }
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
    getNotesByFolder,
    getFavoriteNotes,
    
    // Database maintenance
    clearDatabase,
    getDatabaseSize,
    refreshData,
    clearError,
    importData,
  };
}