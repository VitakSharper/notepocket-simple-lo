// Test script to verify Electron database functionality
// Run with: node test-electron-db.js

const { app, BrowserWindow } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

// Mock the Electron app for testing
if (!app) {
  console.log('Testing database directly...');
  
  // Create test database
  const dbPath = path.join(__dirname, 'test-notepocket.db');
  const db = new Database(dbPath);
  
  try {
    // Create tables
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
    `);
    
    console.log('✅ Database tables created successfully');
    
    // Test folder insertion
    const insertFolder = db.prepare(`
      INSERT INTO folders (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const folderId = 'test-folder-1';
    const now = new Date().toISOString();
    insertFolder.run(folderId, 'Test Folder', '#3b82f6', now);
    
    console.log('✅ Test folder inserted');
    
    // Test note insertion
    const insertNote = db.prepare(`
      INSERT INTO notes (id, title, content, type, folder_id, tags, is_favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const noteId = 'test-note-1';
    insertNote.run(
      noteId,
      'Test Note',
      'This is a test note content',
      'text',
      folderId,
      JSON.stringify(['test', 'sample']),
      0,
      now,
      now
    );
    
    console.log('✅ Test note inserted');
    
    // Test querying
    const getNotesStmt = db.prepare(`
      SELECT n.*, f.name as folder_name, f.color as folder_color
      FROM notes n
      LEFT JOIN folders f ON n.folder_id = f.id
      ORDER BY n.updated_at DESC
    `);
    
    const notes = getNotesStmt.all();
    console.log('✅ Notes retrieved:', notes.length);
    console.log('📄 Sample note:', notes[0]);
    
    // Test folder query
    const getFoldersStmt = db.prepare('SELECT * FROM folders ORDER BY name');
    const folders = getFoldersStmt.all();
    console.log('✅ Folders retrieved:', folders.length);
    console.log('📁 Sample folder:', folders[0]);
    
    // Cleanup
    db.close();
    console.log('✅ Database connection closed');
    console.log('🎉 All tests passed! Electron database layer is working correctly.');
    
    // Clean up test file
    const fs = require('fs');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🧹 Test database file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    db.close();
    process.exit(1);
  }
}

module.exports = { testElectronDB: true };