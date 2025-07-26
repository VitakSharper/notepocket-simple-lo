# Migration Guide: From Browser Storage to Local SQLite

If you were using an earlier version of NotePocket that stored data in browser storage, follow this guide to migrate to the new local SQLite database system.

## Why Migrate?

The new local SQLite implementation offers:
- **True file-based persistence** - Your data is stored in a real file on your computer
- **No browser storage limits** - Database can grow as large as needed
- **Better performance** - Optimized queries and indexing
- **Easy backup** - Simply copy the `.db` file
- **Cross-browser compatibility** - Your data isn't tied to one browser

## Migration Process

### Step 1: Export Your Old Data
If you have an earlier version with export functionality:
1. Open the old version of NotePocket
2. Go to Settings or Export section
3. Export your data as JSON
4. Save the JSON file to your computer

### Step 2: Initialize New Database
1. Open the new version of NotePocket
2. You'll see the database initialization dialog
3. Choose "Create New Database"
4. Select a location (recommended: `Documents/NotePocket/notepocket.db`)

### Step 3: Import Your Data
1. Once the new database is initialized, look for Import functionality
2. Select your exported JSON file
3. Your notes and folders will be imported into the new SQLite database

### Step 4: Verify Migration
1. Check that all your notes are present
2. Verify folder organization is intact
3. Test search and filtering functions
4. Confirm favorites and tags are preserved

## Manual Migration (If No Export Available)

If you don't have an export function in your old version:

### Copy Note Content Manually
1. Open your old NotePocket version
2. Copy important note content to a text file
3. Take screenshots if needed
4. Start fresh with the new version and recreate your notes

### Browser Developer Tools Method
For technically-inclined users:
1. Open old NotePocket in browser
2. Open Developer Tools (F12)
3. Go to Application/Storage tab
4. Find your NotePocket data in localStorage/IndexedDB
5. Copy the data and format it for import

## Benefits After Migration

### File System Integration
- Your database is now a real file: `notepocket.db`
- Backup by copying this file anywhere
- Sync via Dropbox, Google Drive, etc.

### Better Performance
- Faster search across large numbers of notes
- Optimized database queries
- No browser storage quotas

### Cross-Platform Access
- Same database file works across different computers
- Easy to move between devices
- Professional database format

## Backup Strategy

### Regular Backups
1. **Copy the `.db` file** to multiple locations
2. **Cloud sync** - Place database in synced folder
3. **Version control** - Keep dated copies for history

### Export Backups
- Use the built-in export function regularly
- Creates JSON backups that can be imported later
- Useful for archival and migration purposes

## Troubleshooting Migration

### Missing Notes
- Check if export included all data types (text, images, files)
- Some image attachments might need to be re-uploaded
- File attachments may need to be re-linked

### Folder Organization
- Folder colors and names should transfer correctly
- Check that notes are in the right folders
- Recreate folder structure if needed

### Tags and Metadata
- Tags should be preserved in migration
- Favorite status should transfer
- Creation/modification dates might reset

### Performance Issues
- New database might be slower initially
- Performance improves after first few uses
- Consider optimizing if you have >1000 notes

## Getting Help

If you encounter issues during migration:

1. **Check browser compatibility** - Ensure you're using Chrome, Edge, or Safari
2. **File permissions** - Make sure NotePocket can access chosen database location
3. **Export format** - Verify your export file is valid JSON
4. **Start fresh** - If migration fails, you can always start with a new database

## Post-Migration Cleanup

After successful migration:

1. **Verify all data** is correctly imported
2. **Update bookmarks** to new NotePocket URL if changed
3. **Set up backup routine** for your new database file
4. **Consider browser cleanup** - Clear old browser storage if desired

The new local SQLite system provides a much more robust and professional note-taking experience. While migration requires some initial effort, the benefits of true file-based storage make it worthwhile.