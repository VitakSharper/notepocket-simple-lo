# NotePocket - Product Requirements Document

A simple, local-first app to capture, store, and categorize all types of personal notes — including images, PDFs, and text snippets — without cloud dependency or overcomplexity.

**Experience Qualities**:
1. **Effortless** - Capturing and organizing notes should feel as natural as writing on paper
2. **Focused** - Clean, distraction-free interface that prioritizes content over features  
3. **Reliable** - Local-first architecture ensures your notes are always accessible and private

**Complexity Level**: Light Application (multiple features with basic state)
NotePocket bridges the gap between simple note apps and complex document managers, providing essential organization features without overwhelming users with unnecessary complexity.

## Essential Features

### Multi-format Note Creation
- **Functionality**: Create notes from text, images, PDFs, and files with unified interface
- **Purpose**: Single destination for all personal information capture needs
- **Trigger**: Main "+" button, drag-and-drop, or keyboard shortcut
- **Progression**: Select format → Input/upload content → Auto-categorize or manual folder selection → Save
- **Success criteria**: All common file formats supported, seamless creation flow under 3 clicks

### Smart Organization System
- **Functionality**: Custom folders, tagging system, and favorites for flexible categorization
- **Purpose**: Help users find notes quickly without rigid hierarchical constraints
- **Trigger**: Right-click context menu, folder creation button, or tag input field
- **Progression**: Create folder/tag → Assign to notes → Browse by category or tag filter
- **Success criteria**: Users can organize 100+ notes and find any specific note within 10 seconds

### Universal Search & Filter
- **Functionality**: Full-text search across all note types with smart filtering options
- **Purpose**: Instant access to any note regardless of organization method
- **Trigger**: Search bar at top of interface, always visible
- **Progression**: Type query → Real-time results → Filter by type/date/folder → Select note
- **Success criteria**: Sub-second search results, OCR text extraction from images

### Quick Capture Methods
- **Functionality**: Drag-and-drop, screenshot capture, and quick text input
- **Purpose**: Minimize friction between thought/content and storage
- **Trigger**: Drag files to window, screenshot hotkey, or floating quick-note button
- **Progression**: Capture content → Automatic format detection → Quick save or organize
- **Success criteria**: Zero-click file import, one-click text note creation

## Edge Case Handling

- **Large File Uploads**: Progress indicators and size warnings for files over 10MB
- **Corrupted Files**: Graceful error handling with recovery suggestions
- **Empty States**: Helpful onboarding prompts when folders or search results are empty  
- **Duplicate Detection**: Smart warnings when similar content is uploaded
- **Storage Limits**: Local storage monitoring with cleanup suggestions

## Design Direction

The interface should feel like a premium digital notebook - clean, purposeful, and reassuring. Think Apple Notes meets Obsidian's power, with the accessibility of a simple text editor.

## Color Selection

Triadic color scheme balancing productivity with warmth, creating an environment that feels both professional and inviting.

- **Primary Color**: Deep Navy (oklch(0.25 0.15 240)) - Communicates trust, depth, and professional reliability
- **Secondary Colors**: Warm Gray (oklch(0.85 0.02 60)) for backgrounds and subtle UI elements, Soft Blue (oklch(0.75 0.12 220)) for secondary actions  
- **Accent Color**: Amber Gold (oklch(0.75 0.15 85)) - Warm, attention-grabbing highlight for important actions and favorites
- **Foreground/Background Pairings**: 
  - Background (Warm White oklch(0.98 0.01 60)): Deep Navy text (oklch(0.25 0.15 240)) - Ratio 8.2:1 ✓
  - Card (Pure White oklch(1 0 0)): Deep Navy text (oklch(0.25 0.15 240)) - Ratio 9.1:1 ✓
  - Primary (Deep Navy oklch(0.25 0.15 240)): White text (oklch(1 0 0)) - Ratio 9.1:1 ✓
  - Secondary (Warm Gray oklch(0.85 0.02 60)): Deep Navy text (oklch(0.25 0.15 240)) - Ratio 4.9:1 ✓
  - Accent (Amber Gold oklch(0.75 0.15 85)): Deep Navy text (oklch(0.25 0.15 240)) - Ratio 4.8:1 ✓
  - Muted (Light Gray oklch(0.92 0.01 60)): Dark Gray text (oklch(0.45 0.05 240)) - Ratio 5.2:1 ✓

## Font Selection

Typography should convey clarity and professionalism while remaining approachable - Inter for its excellent readability across all sizes and modern, clean aesthetic.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Note Titles): Inter Medium/18px/normal spacing
  - Body (Note Content): Inter Regular/16px/relaxed line height (1.6)
  - Small (Metadata): Inter Regular/14px/muted color
  - Caption (Tags, dates): Inter Medium/12px/uppercase tracking

## Animations

Subtle, purposeful motion that guides user attention and provides feedback without being distracting - emphasizing the app's reliability and polish.

- **Purposeful Meaning**: Gentle slide transitions communicate spatial relationships, fade animations indicate state changes, and micro-bounces provide satisfying feedback for completed actions
- **Hierarchy of Movement**: Primary actions (save, create) get prominent feedback animations, secondary actions (organize, filter) use subtle transitions, background processes (search, loading) show minimal but clear progress indicators

## Component Selection

- **Components**: 
  - Cards for individual notes with hover states
  - Dialogs for note editing and file upload
  - Command palette for search and quick actions
  - Sidebar for folder navigation  
  - Dropdown menus for organization options
  - Progress bars for file operations
  - Badges for tags with custom colors
  - Tooltips for action explanations

- **Customizations**:
  - Custom file drop zone with animated borders
  - Note preview component with format-specific layouts
  - Tag input with autocomplete and color coding
  - Custom screenshot capture overlay

- **States**: 
  - Buttons: Rest (subtle shadow), Hover (lift effect), Active (slight scale), Disabled (opacity + cursor)
  - Inputs: Rest (border), Focus (accent border + shadow), Error (red border + shake), Success (green border + checkmark)
  - Cards: Rest (subtle border), Hover (shadow elevation), Selected (accent border), Loading (skeleton animation)

- **Icon Selection**: Phosphor icons for consistency - Plus for creation, FolderSimple for organization, MagnifyingGlass for search, Star for favorites, Tag for labels

- **Spacing**: 
  - Container padding: 24px (lg)
  - Component gaps: 16px (md) for related elements, 24px (lg) between sections
  - Card padding: 20px (5xl) for content, 12px (3xl) for compact items
  - Button padding: 12px horizontal, 8px vertical for standard buttons

- **Mobile**: 
  - Single-column layout with collapsible sidebar
  - Touch-optimized button sizes (44px minimum)
  - Swipe gestures for note actions
  - Bottom sheet for creation options
  - Responsive typography scaling from 14px base on mobile to 16px on desktop