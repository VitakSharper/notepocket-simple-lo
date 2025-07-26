/**
 * Database service layer that provides high-level operations
 */

import { notesRepo, foldersRepo } from './repositories';
import { electronDatabase, isElectron } from './electron';
import { Note, Folder } from '../types';

export class DatabaseService {
  // Determine which database implementation to use
  private useElectronDB = isElectron();

  // Note operations
  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    if (this.useElectronDB) {
      return await electronDatabase.createNote(noteData);
    }
    return await notesRepo.createNote(noteData);
  }

  async getAllNotes(): Promise<Note[]> {
    if (this.useElectronDB) {
      return await electronDatabase.getNotes();
    }
    return await notesRepo.getAllNotes();
  }

  async getNoteById(id: string): Promise<Note | null> {
    if (this.useElectronDB) {
      const allNotes = await electronDatabase.getNotes();
      return allNotes.find(note => note.id === id) || null;
    }
    return await notesRepo.getNoteById(id);
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    if (this.useElectronDB) {
      await electronDatabase.updateNote(id, updates);
      // Return updated note by fetching it again
      const allNotes = await electronDatabase.getNotes();
      return allNotes.find(note => note.id === id) || null;
    }
    return await notesRepo.updateNote(id, updates);
  }

  async deleteNote(id: string): Promise<boolean> {
    if (this.useElectronDB) {
      await electronDatabase.deleteNote(id);
      return true;
    }
    return await notesRepo.deleteNote(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    if (!query.trim()) {
      return await this.getAllNotes();
    }
    
    if (this.useElectronDB) {
      const allNotes = await electronDatabase.getNotes();
      const lowerQuery = query.toLowerCase();
      return allNotes.filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    return await notesRepo.searchNotes(query);
  }

  async getNotesByFolder(folderId: string | null): Promise<Note[]> {
    if (this.useElectronDB) {
      const allNotes = await electronDatabase.getNotes();
      return allNotes.filter(note => note.folderId === folderId);
    }
    return await notesRepo.getNotesByFolder(folderId);
  }

  async getFavoriteNotes(): Promise<Note[]> {
    if (this.useElectronDB) {
      const allNotes = await electronDatabase.getNotes();
      return allNotes.filter(note => note.isFavorite);
    }
    return await notesRepo.getFavoriteNotes();
  }

  // Folder operations
  async createFolder(folderData: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    if (this.useElectronDB) {
      return await electronDatabase.createFolder(folderData);
    }
    return await foldersRepo.createFolder(folderData);
  }

  async getAllFolders(): Promise<Folder[]> {
    if (this.useElectronDB) {
      return await electronDatabase.getFolders();
    }
    return await foldersRepo.getAllFolders();
  }

  async getFolderById(id: string): Promise<Folder | null> {
    if (this.useElectronDB) {
      const allFolders = await electronDatabase.getFolders();
      return allFolders.find(folder => folder.id === id) || null;
    }
    return await foldersRepo.getFolderById(id);
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    if (this.useElectronDB) {
      // Electron DB doesn't support folder updates yet, would need to implement
      console.warn('Folder updates not implemented for Electron database');
      return null;
    }
    return await foldersRepo.updateFolder(id, updates);
  }

  async deleteFolder(id: string): Promise<boolean> {
    if (this.useElectronDB) {
      await electronDatabase.deleteFolder(id);
      return true;
    }
    return await foldersRepo.deleteFolder(id);
  }

  async getFoldersWithNoteCounts(): Promise<Array<Folder & { noteCount: number }>> {
    if (this.useElectronDB) {
      const [folders, notes] = await Promise.all([
        electronDatabase.getFolders(),
        electronDatabase.getNotes()
      ]);
      
      return folders.map(folder => ({
        ...folder,
        noteCount: notes.filter(note => note.folderId === folder.id).length
      }));
    }
    return await foldersRepo.getFolderWithNoteCount();
  }

  // Bulk operations
  async importData(notes: Note[], folders: Folder[]): Promise<{ notes: number; folders: number }> {
    if (this.useElectronDB) {
      const result = await electronDatabase.importData(notes, folders);
      return { notes: result.notesImported, folders: result.foldersImported };
    }
    
    let importedNotes = 0;
    let importedFolders = 0;

    // Import folders first (to satisfy foreign key constraints)
    for (const folder of folders) {
      try {
        await this.createFolder({
          name: folder.name,
          color: folder.color,
        });
        importedFolders++;
      } catch (error) {
        console.error('Failed to import folder:', folder.name, error);
      }
    }

    // Import notes
    for (const note of notes) {
      try {
        await this.createNote({
          title: note.title,
          content: note.content,
          type: note.type,
          tags: note.tags,
          folderId: note.folderId,
          isFavorite: note.isFavorite,
          fileUrl: note.fileUrl,
          fileName: note.fileName,
          fileSize: note.fileSize,
          fileMimeType: note.fileMimeType,
          embeddedImages: note.embeddedImages,
        });
        importedNotes++;
      } catch (error) {
        console.error('Failed to import note:', note.title, error);
      }
    }

    return { notes: importedNotes, folders: importedFolders };
  }

  // Statistics
  async getStats(): Promise<{
    totalNotes: number;
    totalFolders: number;
    favoriteNotes: number;
    notesByType: Record<string, number>;
  }> {
    const notes = await this.getAllNotes();
    const folders = await this.getAllFolders();

    const notesByType = notes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNotes: notes.length,
      totalFolders: folders.length,
      favoriteNotes: notes.filter(n => n.isFavorite).length,
      notesByType,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();