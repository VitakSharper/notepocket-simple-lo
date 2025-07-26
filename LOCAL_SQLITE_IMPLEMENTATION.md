# Local SQLite Database Implementation

NotePocket now uses a true file-based SQLite database that is stored on your local disk, providing a genuine local-first experience.

## How It Works

### 1. File System Access API
- Uses the modern File System Access API for true file system integration
- Creates a `.db` file on your local disk that persists across sessions
- No browser storage limitations - your database can grow as large as needed

### 2. SQLite WASM
- Powered by `sql.js` - a JavaScript SQLite implementation compiled to WebAssembly
- Full SQL support including complex queries, joins, and transactions
- Same SQLite engine used by mobile apps and desktop software

### 3. Database Structure
```sql
-- Folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Notes table  
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'file')),
  folder_id TEXT,
  tags TEXT,
  is_favorite INTEGER DEFAULT 0,
  image_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
);
```

## Browser Compatibility

### Supported Browsers
- **Chrome 86+** ✅ Full support
- **Edge 86+** ✅ Full support  
- **Safari 15.2+** ✅ Full support
- **Firefox** ❌ Not supported (File System API not implemented)

### Fallback Strategy
For unsupported browsers, the app will show a clear message explaining the requirement for a modern browser with File System Access API support.

## User Experience

### First Launch
1. User is presented with a welcome dialog explaining the local database approach
2. They can either:
   - Select an existing NotePocket `.db` file to open their existing data
   - Choose a location to create a new database file

### Database Location
- Recommended: `Documents/NotePocket/notepocket.db`
- User has full control over where their database is stored
- Can easily backup by copying the `.db` file

### Auto-Save
- Database is automatically saved every 30 seconds
- Changes are also saved immediately after each operation
- No risk of data loss due to browser crashes

## Security & Privacy

### 100% Local
- No data ever leaves your computer
- No cloud storage, no tracking, no analytics
- Your notes are as private as files on your computer

### File System Integration
- Database file can be backed up like any other file
- Can be synced via personal cloud services (Dropbox, Google Drive, etc.)
- Full control over data location and backup strategy

### Encryption Support
- Database file is unencrypted by default for performance
- Future versions could add encryption for sensitive data

## Technical Implementation

### Key Files
- `src/lib/database/localSqlite.ts` - Core database operations
- `src/hooks/useLocalDatabase.ts` - React integration
- `src/components/DatabaseInitDialog.tsx` - User onboarding
- `src/lib/database/demoData.ts` - Initial demo content

### CRUD Operations
All database operations are implemented with proper error handling:
- `createNote()`, `updateNote()`, `deleteNote()`, `getAllNotes()`
- `createFolder()`, `updateFolder()`, `deleteFolder()`, `getAllFolders()`

### Performance Optimizations
- Indexed columns for fast search and filtering
- Prepared statements for repeated queries
- Minimal data loading (only what's needed)

## Development Notes

### Building
- WASM files are automatically copied to `public/` directory during build
- No additional configuration needed for deployment

### Testing
- Database operations can be tested with real SQLite file I/O
- Demo data is automatically created for new databases

### Future Enhancements
- Export/import functionality for database migration
- Advanced search with full-text search (FTS5)
- Database optimization and vacuum operations
- Multi-database support for different projects

## Troubleshooting

### "Browser not supported" Error
- Use Chrome, Edge, or Safari instead of Firefox
- Ensure browser is up to date

### File Access Denied
- Check browser permissions for file system access
- Some corporate networks may block File System API

### Performance Issues
- Large databases (>100MB) may load slowly
- Consider splitting into multiple database files for large datasets

This implementation provides a true desktop-like experience while running in the browser, giving users complete control over their data.