# NotePocket - Local Development Setup

## Fixed Issues ✅
- ❌ Removed GitHub Spark dependencies that caused "Cannot find package '@github/spark'" error
- ❌ Removed Tailwind CSS from Vite config (using MUI instead)
- ❌ Fixed syntax errors in App.tsx
- ❌ Updated ErrorFallback component to use MUI components
- ❌ Cleaned up package.json to include only necessary dependencies
- ✅ Configured Vite for local development

## Prerequisites
- Node.js 16+ (recommended: 18+)
- npm or yarn package manager

## Quick Start

1. **Navigate to your project directory:**
   ```bash
   cd path/to/your/notepocket-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

## Available Scripts
- `npm run dev` - Start development server (hot reload enabled)
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Overview
NotePocket is a local-first note-taking application with:

### ✅ Core Features
- **Multi-format notes**: Text, images, files, and PDFs
- **Organization**: Folders and tags for easy categorization
- **Search**: Full-text search across all notes
- **Local storage**: SQLite database that works offline
- **Export/Import**: Backup and restore your notes
- **Rich text editing**: With image embedding and resizing
- **Responsive design**: Works on desktop and mobile

### 🛠 Technical Stack
- **Frontend**: React 19 + TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Database**: SQLite (browser-based)
- **Build Tool**: Vite
- **File Handling**: Native File API with drag-and-drop

## Troubleshooting

### If you get dependency errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### If the database doesn't initialize:
- Open browser DevTools (F12)
- Clear localStorage for localhost:5173
- Refresh the page

### For TypeScript errors:
The project uses strict TypeScript configuration. Most errors are related to:
- Missing type definitions (already included)
- Unused variables (can be ignored in development)

## Development Notes

### Database Schema
The app automatically creates demo data on first run. The SQLite database includes:
- `notes` table: Stores all note content and metadata
- `folders` table: Organization structure
- `files` table: Binary file storage for attachments

### File Storage
Images and files are stored as base64 in the database for simplicity. For production use, consider:
- External file storage
- File compression
- Lazy loading for large files

### State Management
Uses React hooks with custom database hook (`useDatabase`) for:
- CRUD operations
- Real-time updates
- Error handling
- Loading states

## Next Steps
Once running locally, you can:
1. Create your first note
2. Organize with folders
3. Upload images and files
4. Search your content
5. Export your data for backup

## Support
If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure you're using Node.js 16+
4. Try clearing browser cache/storage