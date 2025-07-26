import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Snackbar, Alert } from '@mui/material';
import { muiTheme } from './theme/muiTheme';
import { Note, Folder, ViewMode, SortOption } from './lib/types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotesGrid } from './components/NotesGrid';
import { CreateNoteModal } from './components/CreateNoteModal';
import { DatabaseInitDialog } from './components/DatabaseInitDialog';
import { DatabaseLoading } from './components/DatabaseLoading';
import { DatabaseStatus } from './components/DatabaseStatus';
import { searchNotes, filterNotes, sortNotes } from './lib/utils';
import { useLocalDatabase } from './hooks/useLocalDatabase';
import { ExportData } from './lib/export';

function App() {
  const {
    notes,
    folders,
    isLoading,
    error,
    isInitialized,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    deleteFolder,
    clearError,
    importData,
    upgradeToFileStorage,
    initialize,
    databaseStatus,
  } = useLocalDatabase();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<Note['type'] | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Auto-initialize on mount with timeout
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      const initWithTimeout = async () => {
        try {
          // Add timeout to prevent infinite waiting
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), 20000);
          });

          await Promise.race([initialize(), timeoutPromise]);
        } catch (error) {
          console.error('Initialization failed or timed out:', error);
          // The error will be handled by the useLocalDatabase hook
        }
      };

      initWithTimeout();
    }
  }, [initialize, isInitialized, isLoading]);

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn('Loading timed out, there may be an issue with initialization');
          setSnackbarMessage('Loading is taking longer than expected. Please refresh the page.');
          setSnackbarOpen(true);
        }
      }, 25000); // 25 second timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [isLoading]);

  // Filter and search notes
  const filteredNotes = () => {
    let result = notes || [];
    
    // Apply search
    if (searchQuery) {
      result = searchNotes(result, searchQuery);
    }
    
    // Apply filters
    result = filterNotes(result, {
      folderId: selectedFolder || undefined,
      favorites: showFavoritesOnly || undefined,
    });
    
    // Apply sorting
    result = sortNotes(result, sortBy);
    
    return result;
  };

  const handleCreateNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createNote(note);
      setCreateModalOpen(false);
      setSnackbarMessage('Note created successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to create note:', err);
      setSnackbarMessage('Failed to create note');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await updateNote(noteId, updates);
      setSnackbarMessage('Note updated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to update note:', err);
      setSnackbarMessage('Failed to update note');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setSnackbarMessage('Note deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setSnackbarMessage('Failed to delete note');
      setSnackbarOpen(true);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder({ name, color });
      setSnackbarMessage('Folder created successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to create folder:', err);
      setSnackbarMessage('Failed to create folder');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      
      // Clear selection if deleted folder was selected
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      setSnackbarMessage('Folder deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete folder:', err);
      setSnackbarMessage('Failed to delete folder');
      setSnackbarOpen(true);
    }
  };

  const handleImportData = async (data: ExportData) => {
    try {
      const result = await importData(data.notes, data.folders);
      setSnackbarMessage('Data imported successfully');
      setSnackbarOpen(true);
      return result;
    } catch (err) {
      console.error('Failed to import data:', err);
      setSnackbarMessage('Failed to import data');
      setSnackbarOpen(true);
      throw err;
    }
  };

  const handleUpgradeToFileStorage = async () => {
    try {
      await upgradeToFileStorage();
      setSnackbarMessage('Successfully upgraded to file storage!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to upgrade to file storage:', err);
      setSnackbarMessage('Failed to upgrade to file storage');
      setSnackbarOpen(true);
    }
  };

  // Clear error when user interacts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Show database initialization dialog only for SQLite initialization attempts
  // With the simplified adapter, we start with memory so no dialog needed

  if (isLoading) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <DatabaseLoading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box display="flex" height="100vh" bgcolor="background.default">
        {/* Mobile layout */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' } }} width="100%">
          <Box display="flex" flexDirection="column" height="100%">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onCreateNote={() => setCreateModalOpen(true)}
              notes={notes}
              folders={folders}
            />
            
            <Box flex={1} overflow="auto" p={2}>
              <NotesGrid
                notes={filteredNotes()}
                viewMode={viewMode}
                folders={folders}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            </Box>
          </Box>
        </Box>

        {/* Desktop layout */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' } }} width="100%" height="100%">
          <Sidebar
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={setShowFavoritesOnly}
            noteCount={notes.length}
            favoriteCount={notes.filter(n => n.isFavorite).length}
            notes={notes}
            onImport={handleImportData}
            onUpgradeToFileStorage={handleUpgradeToFileStorage}
            databaseStatus={databaseStatus}
          />
          
          <Box flex={1} display="flex" flexDirection="column">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onCreateNote={() => setCreateModalOpen(true)}
              notes={notes}
              folders={folders}
            />
            
            <Box flex={1} overflow="auto" p={3}>
              <NotesGrid
                notes={filteredNotes()}
                viewMode={viewMode}
                folders={folders}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            </Box>
          </Box>
        </Box>

        <CreateNoteModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onCreateNote={handleCreateNote}
          folders={folders}
          selectedFolder={selectedFolder}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={error ? 'error' : 'success'}
            variant="filled"
          >
            {snackbarMessage || error}
          </Alert>
        </Snackbar>

        <DatabaseStatus status={databaseStatus} />
      </Box>
    </ThemeProvider>
  );
}

export default App;