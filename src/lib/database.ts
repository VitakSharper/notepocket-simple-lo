import { Note, Folder, EmbeddedImage } from './types';

/**
 * Database service for NotePocket
 * Provides CRUD operations for all data types using browser storage with SQLite-like functionality
 * Handles text, images, files, and binary data storage
 */
export class NotePocketDB {
  private static instance: NotePocketDB;
  private dbName = 'notepocket-db';
  private version = 1;

  private constructor() {}

  static getInstance(): NotePocketDB {
    if (!NotePocketDB.instance) {
      NotePocketDB.instance = new NotePocketDB();
    }
    return NotePocketDB.instance;
  }

  // Initialize database with proper schema
  async init(): Promise<void> {
    try {
      // Using IndexedDB for binary data storage (images, files)
      if ('indexedDB' in window) {
        await this.initIndexedDB();
      }
    } catch (error) {
      console.warn('Database initialization failed, falling back to memory storage:', error);
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores (tables)
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('type', 'type', { unique: false });
          notesStore.createIndex('folderId', 'folderId', { unique: false });
          notesStore.createIndex('isFavorite', 'isFavorite', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('noteId', 'noteId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
          imagesStore.createIndex('noteId', 'noteId', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // NOTES CRUD OPERATIONS
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      await this.promisifyRequest(store.add(newNote));
      
      // Handle embedded images if present
      if (newNote.embeddedImages?.length) {
        await this.storeEmbeddedImages(newNote.id, newNote.embeddedImages);
      }
      
      return newNote;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw new Error('Failed to create note');
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const notes = await this.promisifyRequest(store.getAll()) as Note[];
      
      // Convert date strings back to Date objects
      return notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to get notes:', error);
      return [];
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const note = await this.promisifyRequest(store.get(id)) as Note;
      
      if (!note) return null;
      
      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };
    } catch (error) {
      console.error('Failed to get note:', error);
      return null;
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const existingNote = await this.getNoteById(id);
      if (!existingNote) return null;

      const updatedNote: Note = {
        ...existingNote,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date(),
      };

      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      await this.promisifyRequest(store.put(updatedNote));
      
      // Handle embedded images if updated
      if (updates.embeddedImages) {
        await this.updateEmbeddedImages(id, updates.embeddedImages);
      }
      
      return updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
      throw new Error('Failed to update note');
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes', 'files', 'images'], 'readwrite');
      
      // Delete the note
      const notesStore = transaction.objectStore('notes');
      await this.promisifyRequest(notesStore.delete(id));
      
      // Delete associated files and images
      await this.deleteNoteFiles(id, transaction);
      await this.deleteNoteImages(id, transaction);
      
      return true;
    } catch (error) {
      console.error('Failed to delete note:', error);
      return false;
    }
  }

  // FOLDERS CRUD OPERATIONS
  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const newFolder: Folder = {
      ...folder,
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    try {
      const db = await this.getDB();
      const transaction = db.transaction(['folders'], 'readwrite');
      const store = transaction.objectStore('folders');
      await this.promisifyRequest(store.add(newFolder));
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  async getAllFolders(): Promise<Folder[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const folders = await this.promisifyRequest(store.getAll()) as Folder[];
      
      return folders.map(folder => ({
        ...folder,
        createdAt: new Date(folder.createdAt),
      }));
    } catch (error) {
      console.error('Failed to get folders:', error);
      return [];
    }
  }

  async deleteFolder(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['folders', 'notes'], 'readwrite');
      
      // Delete the folder
      const foldersStore = transaction.objectStore('folders');
      await this.promisifyRequest(foldersStore.delete(id));
      
      // Remove folder reference from notes
      const notesStore = transaction.objectStore('notes');
      const folderIndex = notesStore.index('folderId');
      const notesInFolder = await this.promisifyRequest(folderIndex.getAll(id)) as Note[];
      
      for (const note of notesInFolder) {
        const updatedNote = { ...note, folderId: undefined };
        await this.promisifyRequest(notesStore.put(updatedNote));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete folder:', error);
      return false;
    }
  }

  // FILE STORAGE OPERATIONS
  async storeFile(noteId: string, file: File): Promise<string> {
    try {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileData = {
        id: fileId,
        noteId,
        name: file.name,
        type: file.type,
        size: file.size,
        data: await this.fileToArrayBuffer(file),
        createdAt: new Date(),
      };

      const db = await this.getDB();
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      await this.promisifyRequest(store.add(fileData));
      
      return fileId;
    } catch (error) {
      console.error('Failed to store file:', error);
      throw new Error('Failed to store file');
    }
  }

  async getFile(fileId: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const fileData = await this.promisifyRequest(store.get(fileId));
      
      if (!fileData) return null;
      
      return new Blob([fileData.data], { type: fileData.type });
    } catch (error) {
      console.error('Failed to get file:', error);
      return null;
    }
  }

  // IMAGE STORAGE OPERATIONS
  async storeEmbeddedImages(noteId: string, images: EmbeddedImage[]): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      for (const image of images) {
        const imageData = {
          ...image,
          noteId,
          createdAt: new Date(),
        };
        await this.promisifyRequest(store.put(imageData));
      }
    } catch (error) {
      console.error('Failed to store embedded images:', error);
      throw new Error('Failed to store embedded images');
    }
  }

  async updateEmbeddedImages(noteId: string, images: EmbeddedImage[]): Promise<void> {
    try {
      // First delete existing images for this note
      await this.deleteNoteImages(noteId);
      
      // Then store the new images
      if (images.length > 0) {
        await this.storeEmbeddedImages(noteId, images);
      }
    } catch (error) {
      console.error('Failed to update embedded images:', error);
      throw new Error('Failed to update embedded images');
    }
  }

  // SEARCH OPERATIONS
  async searchNotes(query: string): Promise<Note[]> {
    try {
      const allNotes = await this.getAllNotes();
      const searchTerm = query.toLowerCase();
      
      return allNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Failed to search notes:', error);
      return [];
    }
  }

  async getNotesByType(type: Note['type']): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const index = store.index('type');
      const notes = await this.promisifyRequest(index.getAll(type)) as Note[];
      
      return notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to get notes by type:', error);
      return [];
    }
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const index = store.index('folderId');
      const notes = await this.promisifyRequest(index.getAll(folderId)) as Note[];
      
      return notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to get notes by folder:', error);
      return [];
    }
  }

  async getFavoriteNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const index = store.index('isFavorite');
      const notes = await this.promisifyRequest(index.getAll(true)) as Note[];
      
      return notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to get favorite notes:', error);
      return [];
    }
  }

  // UTILITY METHODS
  private async deleteNoteFiles(noteId: string, transaction?: IDBTransaction): Promise<void> {
    const tx = transaction || (await this.getDB()).transaction(['files'], 'readwrite');
    const store = tx.objectStore('files');
    const index = store.index('noteId');
    const files = await this.promisifyRequest(index.getAll(noteId));
    
    for (const file of files) {
      await this.promisifyRequest(store.delete(file.id));
    }
  }

  private async deleteNoteImages(noteId: string, transaction?: IDBTransaction): Promise<void> {
    const tx = transaction || (await this.getDB()).transaction(['images'], 'readwrite');
    const store = tx.objectStore('images');
    const index = store.index('noteId');
    const images = await this.promisifyRequest(index.getAll(noteId));
    
    for (const image of images) {
      await this.promisifyRequest(store.delete(image.id));
    }
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  private promisifyRequest<T = any>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // DATABASE MAINTENANCE
  async clearDatabase(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes', 'folders', 'files', 'images'], 'readwrite');
      
      await Promise.all([
        this.promisifyRequest(transaction.objectStore('notes').clear()),
        this.promisifyRequest(transaction.objectStore('folders').clear()),
        this.promisifyRequest(transaction.objectStore('files').clear()),
        this.promisifyRequest(transaction.objectStore('images').clear()),
      ]);
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw new Error('Failed to clear database');
    }
  }

  async getDatabaseSize(): Promise<{ notes: number; folders: number; files: number; images: number }> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(['notes', 'folders', 'files', 'images'], 'readonly');
      
      const [notes, folders, files, images] = await Promise.all([
        this.promisifyRequest(transaction.objectStore('notes').count()),
        this.promisifyRequest(transaction.objectStore('folders').count()),
        this.promisifyRequest(transaction.objectStore('files').count()),
        this.promisifyRequest(transaction.objectStore('images').count()),
      ]);
      
      return { notes, folders, files, images };
    } catch (error) {
      console.error('Failed to get database size:', error);
      return { notes: 0, folders: 0, files: 0, images: 0 };
    }
  }
}

// Export singleton instance
export const db = NotePocketDB.getInstance();