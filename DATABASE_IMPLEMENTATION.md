# NotePocket Database Implementation

## Overview

NotePocket now features a comprehensive SQLite-like database system that supports full CRUD operations for all data types including text, images, files, and embedded media. The implementation uses IndexedDB for browser storage with a SQLite-like API.

## Database Architecture

### Core Components

1. **NotePocketDB Class** (`/src/lib/database.ts`)
   - Singleton pattern for database instance
   - IndexedDB-based storage with schema management
   - Full CRUD operations for all data types
   - Advanced query capabilities

2. **useDatabase Hook** (`/src/hooks/useDatabase.ts`)
   - React integration for database operations
   - State synchronization with UI
   - Error handling and loading states
   - Automatic data migration from old KV storage

3. **Migration Service** (`/src/lib/migration.ts`)
   - Seamless migration from KV storage to database
   - Data preservation during upgrades
   - User notification of migration progress

## Supported Data Types

### 1. Text Notes
- **Content**: Markdown with embedded images
- **Features**: Rich text editing, embedded images with resize handles
- **Storage**: Text content, embedded image metadata, resizing data

### 2. Image Notes
- **Content**: Primary image with optional description
- **Features**: Image display, metadata storage, file size tracking
- **Storage**: Base64 encoded images, MIME type, file size, dimensions

### 3. File Notes
- **Content**: File attachments (PDF, TXT, etc.)
- **Features**: File preview, download capabilities, type detection
- **Storage**: Base64 encoded files, MIME type, file size, metadata

### 4. Embedded Images
- **Content**: Images within text notes
- **Features**: Drag-and-drop upload, resize handles, positioning
- **Storage**: Separate image table with note relationships

## CRUD Operations

### Notes

#### Create
```typescript
const note = await db.createNote({
  title: 'My Note',
  content: 'Note content',
  type: 'text',
  tags: ['tag1', 'tag2'],
  folderId: 'folder-id',
  isFavorite: false,
  embeddedImages: [/* image objects */]
});
```

#### Read
```typescript
// Get all notes
const allNotes = await db.getAllNotes();

// Get specific note
const note = await db.getNoteById('note-id');

// Search notes
const results = await db.searchNotes('search query');

// Filter by type
const textNotes = await db.getNotesByType('text');

// Filter by folder
const folderNotes = await db.getNotesByFolder('folder-id');

// Get favorites
const favorites = await db.getFavoriteNotes();
```

#### Update
```typescript
const updatedNote = await db.updateNote('note-id', {
  title: 'Updated Title',
  content: 'Updated content',
  isFavorite: true,
  embeddedImages: [/* updated images */]
});
```

#### Delete
```typescript
const success = await db.deleteNote('note-id');
// Also deletes associated files and embedded images
```

### Folders

#### Create
```typescript
const folder = await db.createFolder({
  name: 'My Folder',
  color: '#ff6b6b'
});
```

#### Read
```typescript
const allFolders = await db.getAllFolders();
```

#### Delete
```typescript
const success = await db.deleteFolder('folder-id');
// Also removes folder references from notes
```

### Files and Images

#### Store File
```typescript
const fileId = await db.storeFile('note-id', fileObject);
```

#### Retrieve File
```typescript
const blob = await db.getFile('file-id');
```

#### Store Embedded Images
```typescript
await db.storeEmbeddedImages('note-id', imageArray);
```

#### Update Embedded Images
```typescript
await db.updateEmbeddedImages('note-id', updatedImageArray);
```

## Advanced Features

### Search Capabilities
- Full-text search across titles, content, and tags
- File name search
- Type-based filtering
- Folder-based filtering
- Favorite filtering

### Database Schema
```sql
-- Object Stores (Tables)
notes: {
  id: string (primary key),
  title: string,
  content: string,
  type: 'text' | 'image' | 'file',
  tags: string[],
  folderId?: string,
  isFavorite: boolean,
  createdAt: Date,
  updatedAt: Date,
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  fileMimeType?: string,
  embeddedImages?: EmbeddedImage[]
}

folders: {
  id: string (primary key),
  name: string,
  color: string,
  createdAt: Date
}

files: {
  id: string (primary key),
  noteId: string (foreign key),
  name: string,
  type: string,
  size: number,
  data: ArrayBuffer,
  createdAt: Date
}

images: {
  id: string (primary key),
  noteId: string (foreign key),
  url: string,
  alt: string,
  fileName: string,
  fileSize: number,
  width?: number,
  height?: number,
  createdAt: Date
}
```

### Indexes
- `notes.type` - for type-based queries
- `notes.folderId` - for folder-based queries  
- `notes.isFavorite` - for favorite queries
- `notes.createdAt` - for date-based sorting
- `notes.tags` - for tag-based search (multiEntry)
- `files.noteId` - for file-note relationships
- `images.noteId` - for image-note relationships

## React Integration

### Component Updates
All components now use async handlers:

```typescript
interface NoteComponentProps {
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}
```

### Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging
- Graceful degradation on failures

### Loading States
- Database initialization spinner
- Upload progress indicators
- Operation feedback via toast notifications

## Migration System

### Automatic Migration
- Detects existing KV storage data
- Migrates notes and folders to database
- Preserves all data including embedded images
- Cleans up old KV storage after migration
- User notification of migration progress

### Data Preservation
- No data loss during migration
- Maintains all relationships
- Preserves timestamps and metadata
- Handles migration errors gracefully

## Performance Optimizations

### Efficient Queries
- Indexed database operations
- Batch operations for bulk updates
- Lazy loading of large images
- Optimized search algorithms

### Memory Management
- Proper cleanup of event listeners
- Efficient file storage using ArrayBuffer
- Garbage collection of unused data
- Controlled image dimensions to prevent memory issues

## Browser Compatibility

### Storage Technology
- **Primary**: IndexedDB (all modern browsers)
- **Fallback**: Memory storage for incompatible browsers
- **Progressive Enhancement**: Features degrade gracefully

### File Size Limits
- **Embedded Images**: 5MB per image
- **File Attachments**: Browser-dependent (typically 50MB+)
- **Total Database**: Browser storage quota (typically several GB)

## Testing

### Comprehensive Test Suite
- Full CRUD operation testing
- Data type validation
- Search functionality testing
- Migration testing
- Error handling verification
- Performance benchmarking

### Test Coverage
- ✅ Text notes with embedded images
- ✅ Image notes with metadata
- ✅ File notes with attachments
- ✅ Folder operations
- ✅ Search and filtering
- ✅ Database maintenance
- ✅ Migration processes

## Usage Examples

### Creating a Rich Text Note with Images
```typescript
const { createNote } = useDatabase();

const embeddedImages = [
  {
    id: 'img-1',
    url: 'data:image/png;base64,...',
    alt: 'Diagram',
    fileName: 'diagram.png',
    fileSize: 2048,
    width: 400,
    height: 300
  }
];

await createNote({
  title: 'Project Documentation',
  content: 'Here is the architecture diagram: ![Diagram](embedded:img-1)',
  type: 'text',
  tags: ['project', 'documentation'],
  folderId: 'work-folder',
  isFavorite: false,
  embeddedImages
});
```

### Searching and Filtering
```typescript
const { searchNotes, getNotesByType, getFavoriteNotes } = useDatabase();

// Search across all content
const searchResults = await searchNotes('project documentation');

// Get only image notes
const imageNotes = await getNotesByType('image');

// Get favorite notes
const favorites = await getFavoriteNotes();
```

This implementation provides a robust, scalable solution for local-first note storage with full CRUD capabilities across all supported data types.