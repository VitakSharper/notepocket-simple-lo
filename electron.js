const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let mainWindow;
let db;

// Database setup
function initializeDatabase() {
  const isDev = process.env.NODE_ENV === 'development';
  const dbPath = isDev 
    ? path.join(__dirname, 'dev-notepocket.db')
    : path.join(app.getPath('userData'), 'notepocket.db');
  
  console.log('Database path:', dbPath);
  
  try {
    db = new Database(dbPath);
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        folder_id TEXT,
        tags TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS note_attachments (
        id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

// IPC handlers for database operations
ipcMain.handle('db-get-notes', () => {
  try {
    const stmt = db.prepare(`
      SELECT n.*, f.name as folder_name, f.color as folder_color
      FROM notes n
      LEFT JOIN folders f ON n.folder_id = f.id
      ORDER BY n.updated_at DESC
    `);
    const notes = stmt.all();
    
    return notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      isFavorite: Boolean(note.is_favorite),
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      folderId: note.folder_id
    }));
  } catch (error) {
    console.error('Error getting notes:', error);
    throw error;
  }
});

ipcMain.handle('db-get-folders', () => {
  try {
    const stmt = db.prepare('SELECT * FROM folders ORDER BY name');
    const folders = stmt.all();
    
    return folders.map(folder => ({
      ...folder,
      createdAt: folder.created_at
    }));
  } catch (error) {
    console.error('Error getting folders:', error);
    throw error;
  }
});

ipcMain.handle('db-create-note', (event, note) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO notes (id, title, content, type, folder_id, tags, is_favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(
      note.id,
      note.title,
      note.content,
      note.type,
      note.folderId || null,
      JSON.stringify(note.tags || []),
      note.isFavorite ? 1 : 0,
      now,
      now
    );
    
    return { id: note.id, ...note, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
});

ipcMain.handle('db-update-note', (event, noteId, updates) => {
  try {
    const setClause = [];
    const params = [];
    
    if (updates.title !== undefined) {
      setClause.push('title = ?');
      params.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClause.push('content = ?');
      params.push(updates.content);
    }
    if (updates.type !== undefined) {
      setClause.push('type = ?');
      params.push(updates.type);
    }
    if (updates.folderId !== undefined) {
      setClause.push('folder_id = ?');
      params.push(updates.folderId);
    }
    if (updates.tags !== undefined) {
      setClause.push('tags = ?');
      params.push(JSON.stringify(updates.tags));
    }
    if (updates.isFavorite !== undefined) {
      setClause.push('is_favorite = ?');
      params.push(updates.isFavorite ? 1 : 0);
    }
    
    const now = new Date().toISOString();
    setClause.push('updated_at = ?');
    params.push(now);
    params.push(noteId);
    
    const stmt = db.prepare(`UPDATE notes SET ${setClause.join(', ')} WHERE id = ?`);
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      throw new Error('Note not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
});

ipcMain.handle('db-delete-note', (event, noteId) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(noteId);
    
    if (result.changes === 0) {
      throw new Error('Note not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
});

ipcMain.handle('db-create-folder', (event, folder) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO folders (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(
      folder.id,
      folder.name,
      folder.color,
      now
    );
    
    return { id: folder.id, ...folder, createdAt: now };
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
});

ipcMain.handle('db-delete-folder', (event, folderId) => {
  try {
    // Update notes to remove folder reference
    const updateNotesStmt = db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?');
    updateNotesStmt.run(folderId);
    
    // Delete the folder
    const deleteFolderStmt = db.prepare('DELETE FROM folders WHERE id = ?');
    const result = deleteFolderStmt.run(folderId);
    
    if (result.changes === 0) {
      throw new Error('Folder not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
});

ipcMain.handle('db-import-data', (event, notes, folders) => {
  try {
    const transaction = db.transaction(() => {
      // Import folders first
      const folderStmt = db.prepare(`
        INSERT OR REPLACE INTO folders (id, name, color, created_at)
        VALUES (?, ?, ?, ?)
      `);
      
      folders.forEach(folder => {
        folderStmt.run(
          folder.id,
          folder.name,
          folder.color,
          folder.createdAt
        );
      });
      
      // Import notes
      const noteStmt = db.prepare(`
        INSERT OR REPLACE INTO notes (id, title, content, type, folder_id, tags, is_favorite, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      notes.forEach(note => {
        noteStmt.run(
          note.id,
          note.title,
          note.content,
          note.type,
          note.folderId || null,
          JSON.stringify(note.tags || []),
          note.isFavorite ? 1 : 0,
          note.createdAt,
          note.updatedAt
        );
      });
    });
    
    transaction();
    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
});

// File operations
ipcMain.handle('save-file', async (event, defaultPath, filters, data) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters
    });
    
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, data);
      return { success: true, filePath: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

ipcMain.handle('open-file', async (event, filters) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters,
      properties: ['openFile']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = fs.readFileSync(filePath, 'utf8');
      return { success: true, data };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error opening file:', error);
    throw error;
  }
});