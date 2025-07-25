/**
 * SQLite database connection and initialization using sql.js for browser compatibility
 */

import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let SqlJs: any = null;

export const getDatabase = async (): Promise<Database> => {
  if (!db) {
    // Initialize sql.js if not done already
    if (!SqlJs) {
      SqlJs = await initSqlJs({
        // Use CDN URL for sql.js wasm file
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
    }

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('notepocket-db');
    if (savedDb) {
      try {
        const data = new Uint8Array(JSON.parse(savedDb));
        db = new SqlJs.Database(data);
      } catch (error) {
        console.warn('Failed to load saved database, creating new one:', error);
        db = new SqlJs.Database();
      }
    } else {
      db = new SqlJs.Database();
    }

    initializeTables();
    
    // Save database periodically
    setInterval(() => saveDatabase(), 10000); // Save every 10 seconds
  }
  return db;
};

export const saveDatabase = (): void => {
  if (db) {
    try {
      const data = db.export();
      const array = Array.from(data);
      localStorage.setItem('notepocket-db', JSON.stringify(array));
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }
};

export const closeDatabase = (): void => {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
};

const initializeTables = (): void => {
  if (!db) return;

  // Create folders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('text', 'image', 'file')),
      tags TEXT NOT NULL DEFAULT '[]',
      folder_id TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_mime_type TEXT,
      embedded_images TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
    );
  `);

  // Create embedded_images table for better normalization (optional)
  db.exec(`
    CREATE TABLE IF NOT EXISTS embedded_images (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes (folder_id);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at);
    CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes (is_favorite);
    CREATE INDEX IF NOT EXISTS idx_notes_type ON notes (type);
    CREATE INDEX IF NOT EXISTS idx_embedded_images_note_id ON embedded_images (note_id);
  `);
};

// Auto-save when page is about to unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    saveDatabase();
  });
}