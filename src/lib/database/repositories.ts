/**
 * Repository layer for database operations
 */

import { getDatabase, saveDatabase } from './connection';
import { 
  NoteModel, 
  FolderModel,
  noteModelToNote, 
  noteToNoteModel, 
  folderModelToFolder, 
  folderToFolderModel 
} from './models';
import { Note, Folder } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class NotesRepository {
  private async getDb() {
    return await getDatabase();
  }

  // Note CRUD operations
  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const db = await this.getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const noteModel = {
      ...noteToNoteModel({ ...noteData, id }),
      created_at: now,
      updated_at: now,
    };

    const stmt = db.prepare(`
      INSERT INTO notes (
        id, title, content, type, tags, folder_id, is_favorite,
        file_url, file_name, file_size, file_mime_type, embedded_images,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      noteModel.id,
      noteModel.title,
      noteModel.content,
      noteModel.type,
      noteModel.tags,
      noteModel.folder_id,
      noteModel.is_favorite,
      noteModel.file_url,
      noteModel.file_name,
      noteModel.file_size,
      noteModel.file_mime_type,
      noteModel.embedded_images,
      noteModel.created_at,
      noteModel.updated_at
    ]);

    saveDatabase();
    return noteModelToNote({ ...noteModel });
  }

  async getAllNotes(): Promise<Note[]> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM notes ORDER BY created_at DESC');
    const notes: NoteModel[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      notes.push(row);
    }
    
    return notes.map(noteModelToNote);
  }

  async getNoteById(id: string): Promise<Note | null> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const note = stmt.getAsObject() as any;
      return noteModelToNote(note);
    }
    
    return null;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    const existingNote = await this.getNoteById(id);
    if (!existingNote) return null;

    const db = await this.getDb();
    const updatedNote = { ...existingNote, ...updates };
    const noteModel = {
      ...noteToNoteModel(updatedNote),
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE notes SET
        title = ?, content = ?, type = ?, tags = ?, folder_id = ?, is_favorite = ?,
        file_url = ?, file_name = ?, file_size = ?, file_mime_type = ?, embedded_images = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run([
      noteModel.title,
      noteModel.content,
      noteModel.type,
      noteModel.tags,
      noteModel.folder_id,
      noteModel.is_favorite,
      noteModel.file_url,
      noteModel.file_name,
      noteModel.file_size,
      noteModel.file_mime_type,
      noteModel.embedded_images,
      noteModel.updated_at,
      id
    ]);

    saveDatabase();
    return noteModelToNote({ ...noteModel, id, created_at: existingNote.createdAt.toISOString() });
  }

  async deleteNote(id: string): Promise<boolean> {
    const db = await this.getDb();
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run([id]);
    saveDatabase();
    return true; // sql.js doesn't return affected rows count easily
  }

  async searchNotes(query: string): Promise<Note[]> {
    const db = await this.getDb();
    // Simple text search since FTS5 might not be available in sql.js
    const stmt = db.prepare(`
      SELECT * FROM notes 
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY created_at DESC
    `);
    
    const searchPattern = `%${query}%`;
    stmt.bind([searchPattern, searchPattern, searchPattern]);
    
    const notes: NoteModel[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      notes.push(row);
    }
    
    return notes.map(noteModelToNote);
  }

  async getNotesByFolder(folderId: string | null): Promise<Note[]> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM notes WHERE folder_id = ? ORDER BY created_at DESC');
    stmt.bind([folderId]);
    
    const notes: NoteModel[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      notes.push(row);
    }
    
    return notes.map(noteModelToNote);
  }

  async getFavoriteNotes(): Promise<Note[]> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM notes WHERE is_favorite = 1 ORDER BY created_at DESC');
    
    const notes: NoteModel[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      notes.push(row);
    }
    
    return notes.map(noteModelToNote);
  }
}

export class FoldersRepository {
  private async getDb() {
    return await getDatabase();
  }

  // Folder CRUD operations
  async createFolder(folderData: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const db = await this.getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const folderModel = {
      ...folderToFolderModel({ ...folderData, id }),
      created_at: now,
    };

    const stmt = db.prepare(`
      INSERT INTO folders (id, name, color, created_at) VALUES (?, ?, ?, ?)
    `);

    stmt.run([folderModel.id, folderModel.name, folderModel.color, folderModel.created_at]);
    saveDatabase();

    return folderModelToFolder(folderModel);
  }

  async getAllFolders(): Promise<Folder[]> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM folders ORDER BY name ASC');
    
    const folders: FolderModel[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      folders.push(row);
    }
    
    return folders.map(folderModelToFolder);
  }

  async getFolderById(id: string): Promise<Folder | null> {
    const db = await this.getDb();
    const stmt = db.prepare('SELECT * FROM folders WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const folder = stmt.getAsObject() as any;
      return folderModelToFolder(folder);
    }
    
    return null;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const existingFolder = await this.getFolderById(id);
    if (!existingFolder) return null;

    const db = await this.getDb();
    const updatedFolder = { ...existingFolder, ...updates };
    const folderModel = folderToFolderModel(updatedFolder);

    const stmt = db.prepare(`
      UPDATE folders SET name = ?, color = ? WHERE id = ?
    `);

    stmt.run([folderModel.name, folderModel.color, id]);
    saveDatabase();

    return folderModelToFolder({ ...folderModel, id, created_at: existingFolder.createdAt.toISOString() });
  }

  async deleteFolder(id: string): Promise<boolean> {
    const db = await this.getDb();
    
    // First, update all notes in this folder to have no folder
    const updateNotesStmt = db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?');
    updateNotesStmt.run([id]);

    // Then delete the folder
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    stmt.run([id]);
    
    saveDatabase();
    return true;
  }

  async getFolderWithNoteCount(): Promise<Array<Folder & { noteCount: number }>> {
    const db = await this.getDb();
    const stmt = db.prepare(`
      SELECT f.*, COUNT(n.id) as note_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id
      GROUP BY f.id
      ORDER BY f.name ASC
    `);
    
    const results: Array<FolderModel & { note_count: number }> = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      results.push(row);
    }
    
    return results.map(row => ({
      ...folderModelToFolder(row),
      noteCount: row.note_count || 0,
    }));
  }
}

// Export singleton instances
export const notesRepo = new NotesRepository();
export const foldersRepo = new FoldersRepository();