import { useState, useEffect, useCallback } from 'react';
import { Note, Folder } from '../types';
import {
  initializeDatabase,
  createNote as createNoteDB,
  updateNote as updateNoteDB,
  deleteNote as deleteNoteDB,
  getAllNotes,
  createFolder as createFolderDB,
  updateFolder as updateFolderDB,
  deleteFolder as deleteFolderDB,
  getAllFolders,
  closeDatabase,
  forceSaveDatabase
} from '../database/localSqlite';

interface DatabaseState {
  notes: Note[];
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export function useLocalDatabase() {
  const [state, setState] = useState<DatabaseState>({
    notes: [],
    folders: [],
    isLoading: true,
    error: null,
    isInitialized: false
  });

  // Initialize database
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await initializeDatabase();
      
      // Load initial data
      const notes = getAllNotes();
      const folders = getAllFolders();
      
      setState({
        notes,
        folders,
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error: any) {
      console.error('Failed to initialize database:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize database',
        isInitialized: false
      }));
    }
  }, []);

  // Refresh data from database
  const refreshData = useCallback(() => {
    try {
      const notes = getAllNotes();
      const folders = getAllFolders();
      
      setState(prev => ({
        ...prev,
        notes,
        folders,
        error: null
      }));
    } catch (error: any) {
      console.error('Failed to refresh data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh data'
      }));
    }
  }, []);

  // Note operations
  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNote = await createNoteDB(noteData);
      setState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
        error: null
      }));
      return newNote;
    } catch (error: any) {
      console.error('Failed to create note:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to create note'
      }));
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await updateNoteDB(id, updates);
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note => note.id === id ? updatedNote : note),
        error: null
      }));
      return updatedNote;
    } catch (error: any) {
      console.error('Failed to update note:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to update note'
      }));
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await deleteNoteDB(id);
      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => note.id !== id),
        error: null
      }));
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete note'
      }));
      throw error;
    }
  }, []);

  // Folder operations
  const createFolder = useCallback(async (folderData: Omit<Folder, 'id' | 'createdAt'>) => {
    try {
      const newFolder = await createFolderDB(folderData);
      setState(prev => ({
        ...prev,
        folders: [...prev.folders, newFolder].sort((a, b) => a.name.localeCompare(b.name)),
        error: null
      }));
      return newFolder;
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to create folder'
      }));
      throw error;
    }
  }, []);

  const updateFolder = useCallback(async (id: string, updates: Partial<Folder>) => {
    try {
      const updatedFolder = await updateFolderDB(id, updates);
      setState(prev => ({
        ...prev,
        folders: prev.folders.map(folder => folder.id === id ? updatedFolder : folder)
          .sort((a, b) => a.name.localeCompare(b.name)),
        error: null
      }));
      return updatedFolder;
    } catch (error: any) {
      console.error('Failed to update folder:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to update folder'
      }));
      throw error;
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      await deleteFolderDB(id);
      // Refresh data to get updated notes (folder_id set to null)
      refreshData();
    } catch (error: any) {
      console.error('Failed to delete folder:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete folder'
      }));
      throw error;
    }
  }, [refreshData]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Import data
  const importData = useCallback(async (notes: Note[], folders: Folder[]) => {
    try {
      // Import folders first
      const importedFolders = [];
      for (const folder of folders) {
        const newFolder = await createFolderDB({
          name: folder.name,
          color: folder.color
        });
        importedFolders.push(newFolder);
      }

      // Import notes
      const importedNotes = [];
      for (const note of notes) {
        const newNote = await createNoteDB({
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
        importedNotes.push(newNote);
      }

      // Refresh data
      refreshData();

      return {
        notes: importedNotes,
        folders: importedFolders
      };
    } catch (error: any) {
      console.error('Failed to import data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to import data'
      }));
      throw error;
    }
  }, [refreshData]);

  // Force save database
  const saveDatabase = useCallback(async () => {
    try {
      await forceSaveDatabase();
    } catch (error: any) {
      console.error('Failed to save database:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to save database'
      }));
      throw error;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Cleanup on unmount
    return () => {
      closeDatabase();
    };
  }, [initialize]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!state.isInitialized) return;

    const interval = setInterval(async () => {
      try {
        await forceSaveDatabase();
        console.log('Database auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state.isInitialized]);

  return {
    notes: state.notes,
    folders: state.folders,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
    clearError,
    importData,
    saveDatabase,
    refreshData,
    initialize
  };
}