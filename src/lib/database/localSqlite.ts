import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { Note, Folder } from '../types';

// SQLite WASM module singleton
let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let fileHandle: FileSystemFileHandle | null = null;

// Initialize SQLite WASM module
async function initSQL(): Promise<SqlJsStatic> {
  if (!SQL) {
    SQL = await initSqlJs({
      // Use WASM files from public directory
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) {
          return `/${file}`;
        }
        return file;
      }
    });
  }
  return SQL;
}

// Check if File System Access API is supported
function isFileSystemAccessSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

// Create database schema
function createTables(database: Database): void {
  // Create folders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // Create notes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('text', 'image', 'file')),
      folder_id TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0,
      image_url TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
    );
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes (folder_id);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at);
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at);
    CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes (is_favorite);
    CREATE INDEX IF NOT EXISTS idx_notes_type ON notes (type);
  `);
}

// Save database to file
async function saveDatabase(): Promise<void> {
  if (!db || !fileHandle) return;

  try {
    const data = db.export();
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
    console.log('Database saved successfully');
  } catch (error) {
    console.error('Failed to save database:', error);
    throw error;
  }
}

// Load database from file
async function loadDatabase(handle: FileSystemFileHandle): Promise<Database> {
  const sql = await initSQL();
  
  try {
    const file = await handle.getFile();
    const buffer = await file.arrayBuffer();
    const database = new sql.Database(new Uint8Array(buffer));
    console.log('Database loaded successfully');
    return database;
  } catch (error) {
    console.error('Failed to load database:', error);
    throw error;
  }
}

// Create new database
async function createNewDatabase(): Promise<Database> {
  const sql = await initSQL();
  const database = new sql.Database();
  createTables(database);
  console.log('New database created');
  return database;
}

// Initialize demo data for new databases
async function initializeDemoDataIfEmpty(): Promise<void> {
  try {
    const notes = getAllNotes();
    if (notes.length === 0) {
      console.log('Empty database detected, initializing with demo data...');
      const { initializeDemoData } = await import('./demoData');
      await initializeDemoData();
    }
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    // Don't throw - demo data is optional
  }
}

// Initialize database - either load existing or create new
export async function initializeDatabase(): Promise<void> {
  try {
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.');
    }

    // Try to open existing database file
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'NotePocket Database',
          accept: { 'application/x-sqlite3': ['.db', '.sqlite', '.sqlite3'] }
        }],
        excludeAcceptAllOption: true,
        multiple: false
      });

      fileHandle = handle;
      db = await loadDatabase(handle);
    } catch (openError) {
      // User cancelled or no file selected, create new database
      console.log('Creating new database...');
      
      // Ask user where to save the new database
      fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: 'notepocket.db',
        types: [{
          description: 'NotePocket Database',
          accept: { 'application/x-sqlite3': ['.db', '.sqlite', '.sqlite3'] }
        }]
      });

      db = createNewDatabase();
      await saveDatabase();
      
      // Initialize demo data for new database
      await initializeDemoDataIfEmpty();
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Get current database instance
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// CRUD Operations for Notes
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const database = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  const stmt = database.prepare(`
    INSERT INTO notes (
      id, title, content, type, folder_id, tags, is_favorite,
      image_url, file_name, file_size, file_type, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    note.title,
    note.content,
    note.type,
    note.folderId || null,
    JSON.stringify(note.tags || []),
    note.isFavorite ? 1 : 0,
    note.imageUrl || null,
    note.fileName || null,
    note.fileSize || null,
    note.fileType || null,
    now,
    now
  ]);

  stmt.free();
  await saveDatabase();

  const newNote: Note = {
    id,
    title: note.title,
    content: note.content,
    type: note.type,
    folderId: note.folderId,
    tags: note.tags || [],
    isFavorite: note.isFavorite || false,
    imageUrl: note.imageUrl,
    fileName: note.fileName,
    fileSize: note.fileSize,
    fileType: note.fileType,
    createdAt: now,
    updatedAt: now
  };

  return newNote;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const database = getDatabase();
  const now = Date.now();

  // Build dynamic UPDATE query
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.folderId !== undefined) {
    fields.push('folder_id = ?');
    values.push(updates.folderId);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.isFavorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(updates.isFavorite ? 1 : 0);
  }
  if (updates.imageUrl !== undefined) {
    fields.push('image_url = ?');
    values.push(updates.imageUrl);
  }
  if (updates.fileName !== undefined) {
    fields.push('file_name = ?');
    values.push(updates.fileName);
  }
  if (updates.fileSize !== undefined) {
    fields.push('file_size = ?');
    values.push(updates.fileSize);
  }
  if (updates.fileType !== undefined) {
    fields.push('file_type = ?');
    values.push(updates.fileType);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  const stmt = database.prepare(`
    UPDATE notes SET ${fields.join(', ')} WHERE id = ?
  `);

  stmt.run(values);
  stmt.free();
  await saveDatabase();

  // Return updated note
  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<void> {
  const database = getDatabase();
  
  const stmt = database.prepare('DELETE FROM notes WHERE id = ?');
  stmt.run([id]);
  stmt.free();
  await saveDatabase();
}

export function getNoteById(id: string): Note {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM notes WHERE id = ?');
  const row = stmt.getAsObject([id]);
  stmt.free();

  if (!row.id) {
    throw new Error(`Note with id ${id} not found`);
  }

  return rowToNote(row);
}

export function getAllNotes(): Note[] {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
  const notes: Note[] = [];
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    notes.push(rowToNote(row));
  }
  
  stmt.free();
  return notes;
}

// CRUD Operations for Folders
export async function createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
  const database = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  const stmt = database.prepare(`
    INSERT INTO folders (id, name, color, created_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run([id, folder.name, folder.color, now]);
  stmt.free();
  await saveDatabase();

  return {
    id,
    name: folder.name,
    color: folder.color,
    createdAt: now
  };
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  const database = getDatabase();

  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }

  values.push(id);

  const stmt = database.prepare(`
    UPDATE folders SET ${fields.join(', ')} WHERE id = ?
  `);

  stmt.run(values);
  stmt.free();
  await saveDatabase();

  return getFolderById(id);
}

export async function deleteFolder(id: string): Promise<void> {
  const database = getDatabase();
  
  // First, update all notes in this folder to have no folder
  const updateNotesStmt = database.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?');
  updateNotesStmt.run([id]);
  updateNotesStmt.free();

  // Then delete the folder
  const deleteFolderStmt = database.prepare('DELETE FROM folders WHERE id = ?');
  deleteFolderStmt.run([id]);
  deleteFolderStmt.free();
  
  await saveDatabase();
}

export function getFolderById(id: string): Folder {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM folders WHERE id = ?');
  const row = stmt.getAsObject([id]);
  stmt.free();

  if (!row.id) {
    throw new Error(`Folder with id ${id} not found`);
  }

  return rowToFolder(row);
}

export function getAllFolders(): Folder[] {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM folders ORDER BY name ASC');
  const folders: Folder[] = [];
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    folders.push(rowToFolder(row));
  }
  
  stmt.free();
  return folders;
}

// Helper functions to convert database rows to objects
function rowToNote(row: any): Note {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    type: row.type as Note['type'],
    folderId: row.folder_id as string || undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    isFavorite: Boolean(row.is_favorite),
    imageUrl: row.image_url as string || undefined,
    fileName: row.file_name as string || undefined,
    fileSize: row.file_size as number || undefined,
    fileType: row.file_type as string || undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number
  };
}

function rowToFolder(row: any): Folder {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: row.created_at as number
  };
}

// Close database connection
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
  fileHandle = null;
}

// Force save database (useful for manual backups)
export async function forceSaveDatabase(): Promise<void> {
  await saveDatabase();
}