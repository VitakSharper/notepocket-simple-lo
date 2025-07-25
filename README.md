# NotePocket - Local SQLite Note Management App

NotePocket is a simple, local-first application for capturing, storing, and categorizing personal notes including text, images, and files. All data is stored locally using SQLite in your browser.

## Features

- 📝 **Multi-format Notes**: Text, image, and file notes
- 📁 **Organization**: Custom folders and tags
- ⭐ **Favorites**: Quick access to important notes
- 🔍 **Search**: Full-text search across all notes
- 💾 **Local Storage**: All data stored locally using SQLite
- 📤 **Export/Import**: Backup and restore your data

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Database**: SQLite (using sql.js for browser compatibility)
- **Build Tool**: Vite
- **Styling**: Material-UI components with custom theme

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notepocket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Database Architecture

The application uses a proper SQLite database with the following structure:

### Models & Schema

- **Notes Table**: Stores all note data with full CRUD operations
- **Folders Table**: Organizes notes into categories
- **Embedded Images Table**: Handles images within notes

### Repository Pattern

- `NotesRepository`: Handles all note-related database operations
- `FoldersRepository`: Manages folder operations
- `DatabaseService`: High-level service layer coordinating repositories

### Data Persistence

- Uses `sql.js` for browser-compatible SQLite
- Data automatically saved to browser localStorage
- Periodic auto-save every 10 seconds
- Save on page unload/refresh

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/
│   ├── database/       # Database layer
│   │   ├── models.ts   # Data models and type conversion
│   │   ├── connection.ts # Database connection management
│   │   ├── repositories.ts # Repository classes for CRUD operations
│   │   └── service.ts  # High-level database service
│   ├── types.ts        # TypeScript type definitions
│   ├── utils.ts        # Utility functions
│   └── export.ts       # Export/import functionality
├── theme/              # MUI theme configuration
└── App.tsx            # Main application component
```

## Features in Detail

### Notes Management
- Create, read, update, delete notes
- Support for text, image, and file attachments
- Rich text editing with embedded images
- Drag & drop file upload
- Image resizing handles

### Organization System
- Custom folders with color coding
- Tag-based categorization
- Favorites system
- Advanced search and filtering

### Local Database
- Full SQLite CRUD operations
- Relational database structure
- Foreign key constraints
- Indexed searches for performance
- Transaction-based operations

### Export/Import
- JSON export for backup
- PDF export for sharing
- Bulk import functionality
- Data validation on import

## Running Without Internet

This application is designed to work completely offline:

1. After the initial load, all functionality works offline
2. SQLite database runs entirely in the browser
3. No external API dependencies for core functionality
4. Images and files stored as base64 in database

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires browsers with WebAssembly support for SQLite functionality.

## Troubleshooting

### Common Issues

1. **Database not loading**: Clear browser localStorage and refresh
2. **Large files causing slowdown**: Consider file size limits in settings
3. **Search not working**: Rebuild search index from settings

### Performance Tips

- Limit embedded images to reasonable sizes
- Use folders to organize large numbers of notes
- Regular export for backup (browser storage can be cleared)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.