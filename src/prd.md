# NotePocket: Enhanced Note-Taking Application

## Core Purpose & Success

**Mission Statement**: NotePocket is a local-first note-taking application that allows users to capture, organize, and manage all types of personal notes including text with embedded images, standalone images, and file attachments without cloud dependency.

**Success Indicators**: Users can efficiently create, edit, and organize notes with embedded media, maintain their data locally, and quickly retrieve information through search and filtering.

**Experience Qualities**: Intuitive, Fast, Reliable

## Project Classification & Approach

**Complexity Level**: Light Application (multiple features with basic state management)
**Primary User Activity**: Creating and organizing notes with embedded media support

## Enhanced Features

### 1. Enhanced Text Notes with Embedded Images
- Rich text editor with markdown support
- **NEW**: Ability to embed images directly within text notes
- Image upload via file picker or drag & drop
- Image insertion via URL
- Support for image captions and alt text
- Embedded images are stored with the note

### 2. Multi-format Note Support
- Text notes with embedded images
- Standalone image notes
- File attachment notes (PDFs, documents)
- Markdown rendering for text content

### 3. Improved Note Editing
- **NEW**: Rich text editor with image embedding toolbar
- **NEW**: Visual management of embedded images
- **NEW**: Image removal and replacement
- Real-time preview of embedded content

### 4. Enhanced Note Viewing
- **NEW**: Detailed note view modal for full content display
- **NEW**: Proper rendering of embedded images in full size
- **NEW**: Click-to-expand functionality for all notes
- Responsive image display

### 5. Organization & Management
- Folder-based organization with color coding
- Tag system for flexible categorization
- Favorites for quick access
- Search across all note types including embedded content

### 6. User Interface Improvements
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

### Key Functionality
- Image upload and base64 conversion
- Markdown-style image references (![alt](embedded:id))
- Dynamic content rendering with embedded images
- Image removal and content cleanup

## User Experience Flow

1. **Creating Notes with Images**:
   - Select text note type
   - Use rich text editor with "Add Image" button
   - Upload images or paste URLs
   - Add captions and organize content
   - Save with embedded images

2. **Viewing Notes**:
   - Click any note card to open detail view
   - See full content with properly rendered images
   - Navigate between edit and view modes
   - Quick actions (favorite, edit, delete)

3. **Managing Content**:
   - Edit notes with embedded image management
   - Remove or replace images within notes
   - Organize notes into folders
   - Search across all content types

## Success Metrics

- Users can successfully embed and manage images in text notes
- Notes with embedded images render properly across all views
- Image upload and management feels intuitive
- Performance remains smooth with embedded media
- Local storage efficiently handles image data