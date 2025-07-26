# NotePocket - Electron Desktop Version

NotePocket now supports a full desktop version using Electron with native SQLite database support for true local file system access.

## Features

### Desktop-Specific Features
- **Native SQLite Database**: Uses better-sqlite3 for true file system database storage
- **Native File Dialogs**: Import/export uses OS-native file pickers  
- **Persistent Data**: All notes and folders stored in a local SQLite database file
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Offline-First**: No internet connection required

### Database Storage
- **Development**: Database stored as `dev-notepocket.db` in project root
- **Production**: Database stored in OS-specific user data directory
  - macOS: `~/Library/Application Support/NotePocket/notepocket.db`
  - Windows: `%APPDATA%/NotePocket/notepocket.db` 
  - Linux: `~/.config/NotePocket/notepocket.db`

## Development Setup

### Prerequisites
- Node.js 16+ with npm
- Python 3.x (for native modules)
- Build tools for your platform:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio Build Tools or Visual Studio Community
  - **Linux**: build-essential package

### Installation

1. Install dependencies including Electron:
```bash
npm install
```

2. Start development server:
```bash
npm run electron
```

This will:
- Start the Vite dev server on http://localhost:5173
- Launch Electron pointing to the dev server
- Enable hot reload for both frontend and Electron main process

### Development Commands

```bash
# Start Electron in development mode (with dev server)
npm run electron

# Start Electron directly (requires built frontend)
npm run electron-dev

# Build frontend for production
npm run build

# Package app for current platform
npm run electron-pack

# Build and package for distribution
npm run dist
```

## Production Build

### Local Build
```bash
# Build and package for current platform
npm run dist
```

This creates platform-specific installers in `dist-electron/`:
- **macOS**: `.dmg` installer
- **Windows**: `.exe` installer  
- **Linux**: `.AppImage` portable app

### Platform-Specific Builds

The app can be built for multiple platforms from a single machine (with some limitations):

```bash
# Build for all platforms (requires additional setup)
npm run electron-pack -- --mac --win --linux

# Build for specific platform
npm run electron-pack -- --mac
npm run electron-pack -- --win  
npm run electron-pack -- --linux
```

## Architecture

### Dual Database Support
The app automatically detects the runtime environment:
- **Electron**: Uses `better-sqlite3` with native file system access
- **Browser**: Falls back to `sql.js` with in-memory/IndexedDB storage

### Security
- **Context Isolation**: Enabled to prevent code injection
- **No Node Integration**: Renderer process isolated from Node.js
- **Preload Script**: Secure IPC bridge between main and renderer processes

### File Structure
```
electron.js          # Main Electron process
preload.js           # Secure IPC bridge
src/
  lib/
    database/
      electron.ts     # Electron-specific database layer
      service.ts      # Unified database service (auto-detects runtime)
  components/
    ExportDialog.tsx  # Enhanced for native file dialogs
```

## Database Schema

The Electron version uses the same schema as the web version but with proper SQLite tables:

```sql
-- Folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Notes table  
CREATE TABLE notes (
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

-- Attachments table (for future file support)
CREATE TABLE note_attachments (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
);
```

## Troubleshooting

### Build Issues

**Node-gyp errors on Windows:**
```bash
npm install --global windows-build-tools
```

**Python not found:**
```bash
npm config set python /path/to/python3
```

**SQLite native module errors:**
```bash
npm rebuild better-sqlite3
```

### Database Issues

**Database locked:**
- Close all Electron instances
- Check for zombie processes: `ps aux | grep electron`

**Corrupted database:**
- Database file location shown in console on startup
- Backup and delete the `.db` file to reset

**Migration from web version:**
- Export data from web version as JSON
- Import using the desktop version's import feature

## Performance

### SQLite Optimizations
- Prepared statements for all queries
- Transaction batching for bulk operations
- Proper indexes on frequently queried columns
- WAL mode for better concurrent access

### Memory Usage
- Lazy loading of note content
- Image compression for embedded images
- Proper cleanup of file handles

## Security Considerations

### Data Encryption
Currently, the SQLite database is stored unencrypted. For sensitive data:
- Use OS-level disk encryption (FileVault, BitLocker, etc.)
- Consider implementing database encryption in future versions

### File Access
- Database files only accessible to current user
- No network access required for core functionality
- Import/export limited to user-selected files only

## Future Enhancements

### Planned Features
- [ ] Database encryption
- [ ] File attachment support (images, PDFs)
- [ ] Database backup/sync options
- [ ] Multiple database profiles
- [ ] Plugin system for extensions
- [ ] Advanced search with full-text indexing

### Performance Improvements
- [ ] Incremental loading for large note collections
- [ ] Background database optimization
- [ ] Memory usage optimization for large attachments