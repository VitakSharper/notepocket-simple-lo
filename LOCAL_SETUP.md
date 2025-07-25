# Local Development Guide

## Quick Start

NotePocket is now ready to run locally on your PC! Here's how to get started:

### Prerequisites
- Node.js version 18 or higher
- npm (comes with Node.js)

### Step-by-Step Setup

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Choose the LTS version
   - Install with default settings

2. **Open Terminal/Command Prompt** in the project directory

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Your Browser**:
   - Navigate to `http://localhost:5173`
   - The application should load with demo data

### Available Scripts

- `npm run dev` - Start development server (hot reload enabled)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run code linting

### Troubleshooting

**"Cannot find package '@github/spark'" Error:**
✅ **FIXED!** This error has been resolved. The application no longer depends on GitHub Spark packages.

**Port 5173 already in use:**
- Kill any existing processes using that port
- Or Vite will automatically use the next available port

**Node.js version errors:**
- Ensure you have Node.js 18 or higher installed
- Check version with: `node -v`

### Production Deployment

To deploy to a web server:

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains all files needed for deployment

3. Upload the `dist/` folder contents to your web server

4. Serve the files using any static file server (Apache, Nginx, etc.)

### Data Storage

- All notes are stored locally in your browser's IndexedDB
- No internet connection required after initial load
- Data persists between browser sessions
- Each browser/device maintains separate storage

### Features Working Locally

✅ Create, edit, and delete text notes  
✅ Upload and manage image files  
✅ Organize notes with folders and tags  
✅ Search and filter functionality  
✅ Export notes as JSON or PDF  
✅ Drag and drop file uploads  
✅ Responsive design for all screen sizes  

The application is now fully functional for local development and can be deployed to any web hosting service!