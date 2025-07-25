/**
 * Database service layer that provides high-level operations
 */

import { notesRepo, foldersRepo } from './repositories';
import { Note, Folder } from '../types';

export class DatabaseService {
  // Note operations
  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    return await notesRepo.createNote(noteData);
  }

  async getAllNotes(): Promise<Note[]> {
    return await notesRepo.getAllNotes();
  }

  async getNoteById(id: string): Promise<Note | null> {
    return await notesRepo.getNoteById(id);
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    return await notesRepo.updateNote(id, updates);
  }

  async deleteNote(id: string): Promise<boolean> {
    return await notesRepo.deleteNote(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    if (!query.trim()) {
      return await this.getAllNotes();
    }
    return await notesRepo.searchNotes(query);
  }

  async getNotesByFolder(folderId: string | null): Promise<Note[]> {
    return await notesRepo.getNotesByFolder(folderId);
  }

  async getFavoriteNotes(): Promise<Note[]> {
    return await notesRepo.getFavoriteNotes();
  }

  // Folder operations
  async createFolder(folderData: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    return await foldersRepo.createFolder(folderData);
  }

  async getAllFolders(): Promise<Folder[]> {
    return await foldersRepo.getAllFolders();
  }

  async getFolderById(id: string): Promise<Folder | null> {
    return await foldersRepo.getFolderById(id);
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    return await foldersRepo.updateFolder(id, updates);
  }

  async deleteFolder(id: string): Promise<boolean> {
    return await foldersRepo.deleteFolder(id);
  }

  async getFoldersWithNoteCounts(): Promise<Array<Folder & { noteCount: number }>> {
    return await foldersRepo.getFolderWithNoteCount();
  }

  // Bulk operations
  async importData(notes: Note[], folders: Folder[]): Promise<{ notes: number; folders: number }> {
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