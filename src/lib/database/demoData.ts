import { 
  createNote, 
  createFolder,
  getAllNotes,
  getAllFolders 
} from './localSqlite';

export async function initializeDemoData(): Promise<void> {
  try {
    // Check if data already exists
    const existingNotes = getAllNotes();
    const existingFolders = getAllFolders();
    
    if (existingNotes.length > 0 || existingFolders.length > 0) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    console.log('Initializing demo data...');

    // Create demo folders
    const workFolder = await createFolder({
      name: 'Work',
      color: '#1976d2'
    });

    const personalFolder = await createFolder({
      name: 'Personal',
      color: '#388e3c'
    });

    const ideasFolder = await createFolder({
      name: 'Ideas',
      color: '#f57c00'
    });

    // Create demo notes
    await createNote({
      title: 'Welcome to NotePocket!',
      content: `# Welcome to NotePocket! 🎉

This is your personal note-taking app that works completely offline. Your data is stored locally on your computer for maximum privacy and security.

## Key Features:
- **Text Notes**: Rich text with Markdown support
- **Image Notes**: Upload and organize images
- **File Attachments**: Attach PDFs and other documents
- **Folders & Tags**: Organize your content
- **Search**: Find notes quickly
- **Export**: Backup your data anytime

## Getting Started:
1. Click the **+** button to create your first note
2. Use folders to organize your notes
3. Add tags for better searchability
4. Star important notes as favorites

Your database file is saved locally - remember to backup it regularly!`,
      type: 'text',
      folderId: undefined,
      tags: ['welcome', 'guide'],
      isFavorite: true
    });

    await createNote({
      title: 'Project Planning Notes',
      content: `# Q1 Project Goals

## Priority 1 - Database Migration
- [x] Research SQLite integration
- [x] Design local storage architecture
- [ ] Implement file-based persistence
- [ ] Add backup/restore functionality

## Priority 2 - UI Improvements  
- [ ] Dark mode support
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts
- [ ] Drag & drop file uploads

## Meeting Notes - Jan 15
- Discussed database requirements
- Agreed on local-first approach
- Timeline: 2 weeks for MVP`,
      type: 'text',
      folderId: workFolder.id,
      tags: ['project', 'planning', 'database'],
      isFavorite: false
    });

    await createNote({
      title: 'Recipe Ideas',
      content: `# Dinner Ideas for This Week

## Monday - Pasta Night
**Creamy Mushroom Pasta**
- Ingredients: pasta, mushrooms, cream, garlic, parmesan
- Cook time: 20 minutes
- Notes: Add spinach for extra nutrition

## Tuesday - Healthy Bowl
**Mediterranean Quinoa Bowl**
- Base: quinoa
- Toppings: cucumber, tomatoes, olives, feta
- Dressing: olive oil, lemon, herbs

## Wednesday - Comfort Food
**Chicken Curry**
- Prep time: 15 minutes
- Cook time: 30 minutes
- Serve with basmati rice and naan

*Remember to check what vegetables need to be used up!*`,
      type: 'text',
      folderId: personalFolder.id,
      tags: ['recipes', 'food', 'planning'],
      isFavorite: false
    });

    await createNote({
      title: 'App Feature Ideas',
      content: `# Future Feature Ideas 💡

## Core Features
- [ ] Voice notes with transcription
- [ ] Document scanning (camera)
- [ ] Collaborative notes (shared folders)
- [ ] Advanced search with filters
- [ ] Note templates

## Integrations
- [ ] Calendar sync for meeting notes
- [ ] Email integration (save emails as notes)
- [ ] Cloud backup options (optional)
- [ ] Browser extension for web clipping

## Advanced Features
- [ ] AI-powered note suggestions
- [ ] Automatic tagging
- [ ] Note linking and backlinks
- [ ] Version history
- [ ] Encryption for sensitive notes

*These are just ideas - focus on core functionality first!*`,
      type: 'text',
      folderId: ideasFolder.id,
      tags: ['features', 'development', 'roadmap'],
      isFavorite: true
    });

    await createNote({
      title: 'Quick Shopping List',
      content: `# Grocery Shopping

## Essentials
- [x] Milk
- [x] Eggs  
- [x] Bread
- [ ] Apples
- [ ] Chicken breast
- [ ] Rice

## Snacks
- [ ] Yogurt
- [ ] Nuts
- [ ] Dark chocolate

## Household
- [ ] Dish soap
- [ ] Paper towels
- [ ] Laundry detergent

*Total budget: ~$80*`,
      type: 'text',
      folderId: personalFolder.id,
      tags: ['shopping', 'list'],
      isFavorite: false
    });

    await createNote({
      title: 'Database Architecture',
      content: `# NotePocket Database Design

## Tables Structure

### notes
- id (TEXT PRIMARY KEY)
- title (TEXT NOT NULL)
- content (TEXT NOT NULL)  
- type (TEXT CHECK: 'text', 'image', 'file')
- folder_id (TEXT, FK to folders.id)
- tags (TEXT, JSON array) 
- is_favorite (INTEGER, 0/1)
- image_url (TEXT, for image notes)
- file_name (TEXT, for file notes)
- file_size (INTEGER, bytes)
- file_type (TEXT, MIME type)
- created_at (INTEGER, timestamp)
- updated_at (INTEGER, timestamp)

### folders  
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- color (TEXT NOT NULL, hex color)
- created_at (INTEGER, timestamp)

## Indexes
- idx_notes_folder_id
- idx_notes_created_at
- idx_notes_updated_at  
- idx_notes_is_favorite
- idx_notes_type

This design supports all note types while maintaining good performance for search and filtering operations.`,
      type: 'text',
      folderId: workFolder.id,
      tags: ['database', 'architecture', 'technical'],
      isFavorite: false
    });

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    throw error;
  }
}