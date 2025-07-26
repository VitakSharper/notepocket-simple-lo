# NotePocket

A simple, local-first note-taking application that supports text, images, and file attachments without cloud dependency or complexity.

## Available Versions

### 🌐 Web Version (Browser)
- Runs in any modern web browser
- Uses IndexedDB for local storage
- Perfect for quick note-taking and web-based workflows
- Access via hosted version or run locally with `npm run dev`

### 🖥️ Desktop Version (Electron)
- Native desktop application for Windows, macOS, and Linux
- Uses SQLite database with true file system persistence
- Native file dialogs for import/export
- Enhanced performance and offline capabilities
- See [ELECTRON_SETUP.md](./ELECTRON_SETUP.md) for detailed setup instructions

## Quick Start

### Web Development
```bash
npm install
npm run dev
```
Open http://localhost:5173

### Desktop Development  
```bash
npm install
npm run electron
```
Launches Electron app with hot reload

### Desktop Production Build
```bash
npm run dist
```
Creates platform-specific installers in `dist-electron/`

## Core Features

### 📝 Multi-format Notes
- Rich text editing with markdown support
- Image attachments with drag & drop
- File attachments (PDFs, documents)
- Embedded images within notes with resize handles

### 📁 Organization
- Custom folders with color coding
- Tag-based categorization
- Favorites for quick access
- Search across all content

### 💾 Data Management
- **Web**: IndexedDB storage with JSON export/import
- **Desktop**: SQLite database with native file dialogs
- Backup and restore functionality
- CSV export for data portability

### 🎨 Modern Interface
- Clean, distraction-free design using Material-UI
- Responsive layout for mobile and desktop
- Grid and list view modes
- Real-time search and filtering

## Architecture

### Database Layer
- **Web**: Uses sql.js with IndexedDB persistence
- **Desktop**: Native better-sqlite3 with file system storage
- Unified service layer automatically detects runtime environment
- Full CRUD operations for notes, folders, and attachments

### Technology Stack
- **Frontend**: React 19, Material-UI, TypeScript
- **Database**: SQLite (better-sqlite3 for Electron, sql.js for web)
- **Desktop**: Electron with secure IPC
- **Build**: Vite for fast development and optimized builds

## Security & Privacy

- **Local-First**: All data stored locally, no cloud dependency
- **No Tracking**: No analytics, telemetry, or external connections
- **Secure**: Electron app uses context isolation and secure IPC
- **Privacy**: Your notes never leave your device

## Development

### Prerequisites
- Node.js 16+
- For Electron builds: Platform-specific build tools (see ELECTRON_SETUP.md)

### Commands
```bash
# Web development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Desktop development  
npm run electron     # Start Electron with hot reload
npm run electron-dev # Start Electron directly
npm run electron-pack # Package for current platform
npm run dist         # Build and create installer

# Other
npm run lint         # ESLint check
npm run optimize     # Vite dependency optimization
```

### Project Structure
```
src/
  components/        # React components
    ui/             # shadcn/ui components
  lib/
    database/       # Database layer
      electron.ts   # Electron-specific implementation
      service.ts    # Unified database service
    types.ts        # TypeScript definitions
    export.ts       # Import/export functionality
  hooks/            # Custom React hooks
  theme/            # Material-UI theme

electron.js         # Electron main process
preload.js          # Secure IPC bridge
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both web and desktop versions
5. Submit a pull request

## License

MIT License - see LICENSE file for details.