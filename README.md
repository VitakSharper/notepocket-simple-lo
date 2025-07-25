# NotePocket

A simple, local-first note-taking application for capturing, storing, and organizing all types of personal notes including text, images, and files.

## Features

- **Multi-format Notes**: Text notes (with Markdown support), image notes, and file attachments
- **Simple Organization**: Custom folders, tags, and favorites
- **Local Storage**: All data is stored locally using IndexedDB - no cloud dependency
- **Search & Filter**: Full-text search and filtering by type, folder, or favorites
- **Export**: Backup your notes as JSON or PDF files
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notepocket
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, which you can serve with any static file server.

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Database**: IndexedDB (browser storage)
- **Build Tool**: Vite
- **Icons**: Lucide React, Phosphor Icons

## Local Development

The application uses IndexedDB for local storage, which means:

- All your notes are stored locally in your browser
- No internet connection required after initial load
- Data persists between browser sessions
- Each browser/device has its own separate storage

### Demo Data

On first run, the application will populate with demo notes and folders to help you get started. You can delete these once you start adding your own content.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.