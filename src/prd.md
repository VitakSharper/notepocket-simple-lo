# NotePocket: Local-First SQLite Note-Taking Application

## Core Purpose & Success

**Mission Statement**: NotePocket is a true local-first note-taking application that stores data in a local SQLite database file, allowing users to capture, organize, and manage all types of personal notes including text with embedded images, standalone images, and file attachments with complete privacy and offline functionality.

**Success Indicators**: Users can efficiently create, edit, and organize notes with embedded media, maintain their data in a local SQLite file with no cloud dependency, and quickly retrieve information through database-powered search and filtering.

**Experience Qualities**: Private, Fast, Professional

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality with local database storage)
**Primary User Activity**: Creating and organizing notes with professional-grade local database persistence

## Revolutionary Database Implementation

### 1. True Local SQLite Database
- **File-based persistence**: Real `.db` file stored on user's computer
- **No browser storage limits**: Database can grow to gigabytes
- **Cross-session persistence**: Data survives browser crashes, updates, and reinstalls
- **Professional database format**: Same SQLite used by major applications
- **Backup-friendly**: Simply copy the `.db` file for complete backup

### 2. File System Integration
- **File System Access API**: Direct integration with operating system
- **User-controlled location**: Users choose where to store their database
- **Easy migration**: Database file can be moved between computers
- **Sync compatibility**: Works with Dropbox, Google Drive, and other sync services

### 3. Database Schema
```sql
-- Professional database structure
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'file')),
  folder_id TEXT REFERENCES folders(id),
  tags TEXT, -- JSON array
  is_favorite INTEGER DEFAULT 0,
  image_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## Enhanced Features

### 1. Professional Note Management
- Rich text editor with markdown support
- Ability to embed images directly within text notes
- Resizable images with drag handles for custom sizing
- Image upload via file picker or drag & drop
- Support for all note types (text, image, file)

### 2. Database-Powered Performance
- **Indexed search**: Lightning-fast full-text search across all notes
- **Optimized queries**: Complex filtering and sorting operations
- **Relationship integrity**: Foreign key constraints maintain data consistency
- **Transaction safety**: All operations are atomic and crash-safe

### 3. Advanced Organization
- Folder-based organization with color coding
- Tag system for flexible categorization  
- Favorites system for quick access
- Advanced filtering by type, folder, tags, and date ranges
- Favorites for quick access
- Search across all note types including embedded content

### 6. Data Export & Backup
- **NEW**: Complete data export as JSON backup files
- **NEW**: PDF export for printable note collections
- **NEW**: Organized PDF output with folder structure
- **NEW**: Import functionality from JSON backups
- **NEW**: Data migration and backup preservation

### 7. User Interface Improvements
- **NEW**: Rich text editor component
- **NEW**: Note detail modal for expanded viewing
- **NEW**: Image management interface
- Responsive design for mobile and desktop
- Intuitive navigation and interaction patterns

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Professional yet approachable, encouraging creativity and organization
**Design Personality**: Clean, modern, and focused on content
**Visual Metaphors**: Digital notebook with multimedia capabilities

### Color Strategy
**Color Scheme Type**: Triadic color scheme
**Primary Color**: Deep blue (oklch(0.25 0.15 240)) - conveys trust and stability
**Secondary Colors**: Warm gray (oklch(0.85 0.02 60)) - provides gentle contrast
**Accent Color**: Warm yellow (oklch(0.75 0.15 85)) - highlights actions and favorites

### Typography System
**Font Pairing Strategy**: Inter for all text elements
**Typographic Hierarchy**: Clear distinction between headings, body text, and metadata
**Font Personality**: Modern, clean, highly legible

### Component Enhancements
- **Rich Text Editor**: Integrated toolbar for image insertion
- **Image Management**: Visual grid for embedded image management
- **Note Cards**: Enhanced preview with proper image rendering
- **Detail Modal**: Full-screen note viewing with proper image display

## Technical Implementation

### Data Structure Enhancements
- Extended Note interface with `embeddedImages` array
- EmbeddedImage interface for image metadata
- Base64 encoding for local image storage
- Proper image reference management

### Component Architecture
- RichTextEditor: Handles text editing with image embedding
- NoteContentRenderer: Renders notes with embedded images
- NoteDetailModal: Full note viewing experience
- Enhanced CreateNoteModal and EditNoteModal
- **NEW**: ExportDialog: Comprehensive backup and restore interface
- **NEW**: Export utilities for JSON and PDF generation

### Key Functionality
- Image upload and base64 conversion
- **NEW**: JSON export with complete note and folder data
- **NEW**: PDF generation with formatted note content
- **NEW**: Import validation and data restoration
- **NEW**: Backup file handling and user feedback
- Markdown-style image references (![alt](embedded:id))
- Dynamic content rendering with embedded images
- Image removal and content cleanup

## User Experience Flow

1. **Creating Notes with Images**:
   - Select text note type
   - Use rich text editor with "Add Image" button
   - Upload images or paste URLs
   - **NEW**: Resize images using visual drag handles on corners and edges
   - Add captions and organize content
   - Save with embedded images and custom dimensions

2. **Viewing Notes**:
   - Click any note card to open detail view
   - See full content with properly rendered images at saved sizes
   - **NEW**: Resize images directly in view mode for better readability
   - Navigate between edit and view modes
   - Quick actions (favorite, edit, delete)

3. **Managing Content**:
   - Edit notes with embedded image management
   - **NEW**: Interactive image resizing with real-time dimension feedback
   - Remove or replace images within notes
   - Organize notes into folders
   - Search across all content types

## Success Metrics

- Users can successfully embed and manage images in text notes
- **NEW**: Users can intuitively resize images using visual drag handles
- Notes with embedded images render properly across all views at custom sizes
- Image upload and management feels intuitive
- **NEW**: Image resizing provides immediate visual feedback and maintains aspect ratios
- Performance remains smooth with embedded media
- Local storage efficiently handles image data and dimensions