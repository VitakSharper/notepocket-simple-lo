import { Note, Folder } from '../types';

// Simple in-memory fallback database for development/testing
class InMemoryDatabase {
  private notes: Note[] = [];
  private folders: Folder[] = [];

  async initializeDatabase(): Promise<void> {
    console.log('Using in-memory database fallback');
    // Initialize with demo data
    await this.initializeDemoData();
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const id = crypto.randomUUID();
    const now = Date.now();
    
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

    this.notes.unshift(newNote);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const noteIndex = this.notes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }

    const updatedNote = {
      ...this.notes[noteIndex],
      ...updates,
      updatedAt: Date.now()
    };

    this.notes[noteIndex] = updatedNote;
    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    const noteIndex = this.notes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    this.notes.splice(noteIndex, 1);
  }

  getAllNotes(): Note[] {
    return [...this.notes];
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const id = crypto.randomUUID();
    const now = Date.now();

    const newFolder: Folder = {
      id,
      name: folder.name,
      color: folder.color,
      createdAt: now
    };

    this.folders.push(newFolder);
    this.folders.sort((a, b) => a.name.localeCompare(b.name));
    return newFolder;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const folderIndex = this.folders.findIndex(f => f.id === id);
    if (folderIndex === -1) {
      throw new Error(`Folder with id ${id} not found`);
    }

    const updatedFolder = {
      ...this.folders[folderIndex],
      ...updates
    };

    this.folders[folderIndex] = updatedFolder;
    this.folders.sort((a, b) => a.name.localeCompare(b.name));
    return updatedFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    const folderIndex = this.folders.findIndex(f => f.id === id);
    if (folderIndex === -1) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Remove folder reference from notes
    this.notes.forEach(note => {
      if (note.folderId === id) {
        note.folderId = undefined;
      }
    });

    this.folders.splice(folderIndex, 1);
  }

  getAllFolders(): Folder[] {
    return [...this.folders];
  }

  closeDatabase(): void {
    // No-op for in-memory database
  }

  async forceSaveDatabase(): Promise<void> {
    // No-op for in-memory database
  }

  private async initializeDemoData(): Promise<void> {
    try {
      // Create demo folders
      const workFolder = await this.createFolder({
        name: 'Work',
        color: '#1976d2'
      });

      const personalFolder = await this.createFolder({
        name: 'Personal',
        color: '#388e3c'
      });

      const ideasFolder = await this.createFolder({
        name: 'Ideas',
        color: '#f57c00'
      });

      // Create demo notes
      await this.createNote({
        title: 'Welcome to NotePocket!',
        content: `# Welcome to NotePocket! 🎉

This is your personal note-taking app. This demo is running with an in-memory database.

## Key Features:
- **Text Notes**: Rich text with Markdown support
- **Folders & Tags**: Organize your content
- **Search**: Find notes quickly
- **Local Storage**: Your data stays private

## Getting Started:
1. Click the **+** button to create your first note
2. Use folders to organize your notes
3. Add tags for better searchability
4. Star important notes as favorites

*Note: This is a demo mode. For persistent storage, use the SQLite version.*`,
        type: 'text',
        folderId: undefined,
        tags: ['welcome', 'demo'],
        isFavorite: true
      });

      await this.createNote({
        title: 'Project Planning Notes',
        content: `# Q1 Project Goals

## Priority 1 - Database Integration
- [x] Research SQLite integration
- [x] Design local storage architecture
- [ ] Implement file-based persistence
- [ ] Add backup/restore functionality

## Priority 2 - UI Improvements  
- [ ] Dark mode support
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts
- [ ] Drag & drop file uploads`,
        type: 'text',
        folderId: workFolder.id,
        tags: ['project', 'planning'],
        isFavorite: false
      });

      await this.createNote({
        title: 'Quick Ideas',
        content: `# Random Thoughts 💡

- Add voice notes functionality
- Integration with calendar
- Collaborative notes feature
- Advanced search filters
- Note templates
- Export to different formats

*Keep this list updated with new ideas!*`,
        type: 'text',
        folderId: ideasFolder.id,
        tags: ['ideas', 'features'],
        isFavorite: true
      });

      console.log('Demo data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }
}

// Create singleton instance
const inMemoryDB = new InMemoryDatabase();

// Export functions that match the SQLite interface
export async function initializeDatabase(): Promise<void> {
  return inMemoryDB.initializeDatabase();
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  return inMemoryDB.createNote(note);
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  return inMemoryDB.updateNote(id, updates);
}

export async function deleteNote(id: string): Promise<void> {
  return inMemoryDB.deleteNote(id);
}

export function getAllNotes(): Note[] {
  return inMemoryDB.getAllNotes();
}

export async function createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
  return inMemoryDB.createFolder(folder);
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  return inMemoryDB.updateFolder(id, updates);
}

export async function deleteFolder(id: string): Promise<void> {
  return inMemoryDB.deleteFolder(id);
}

export function getAllFolders(): Folder[] {
  return inMemoryDB.getAllFolders();
}

export function closeDatabase(): void {
  return inMemoryDB.closeDatabase();
}

export async function forceSaveDatabase(): Promise<void> {
  return inMemoryDB.forceSaveDatabase();
}