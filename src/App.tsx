import { useState, useEffect } from 'react';
import { Note, Folder, SearchFilters, ViewMode, SortOption } from './lib/types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotesGrid } from './components/NotesGrid';
import { CreateNoteModal } from './components/CreateNoteModal';
import { Toaster } from './components/ui/sonner';
import { searchNotes, filterNotes, sortNotes } from './lib/utils';
import { useDatabase } from './hooks/useDatabase';
import { demoNotes, demoFolders } from './lib/demoData';
import { ExportData } from './lib/export';

function App() {
  const {
    notes,
    folders,
    isLoading,
    error,
    createNote: dbCreateNote,
    updateNote: dbUpdateNote,
    deleteNote: dbDeleteNote,
    createFolder: dbCreateFolder,
    deleteFolder: dbDeleteFolder,
    clearError,
    importData,
  } = useDatabase();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<Note['type'] | null>(null);

  // Initialize with demo data on first visit if database is empty
  useEffect(() => {
    const initializeDemoData = async () => {
      if (!isLoading && notes.length === 0 && folders.length === 0) {
        try {
          // Create demo folders first
          for (const folder of demoFolders) {
            await dbCreateFolder({
              name: folder.name,
              color: folder.color,
            });
          }
          
          // Then create demo notes
          for (const note of demoNotes) {
            await dbCreateNote({
              title: note.title,
              content: note.content,
              type: note.type,
              tags: note.tags,
              folderId: note.folderId,
              isFavorite: note.isFavorite,
              fileUrl: note.fileUrl,
              fileName: note.fileName,
              fileSize: note.fileSize,
              fileMimeType: note.fileMimeType,
              embeddedImages: note.embeddedImages,
            });
          }
        } catch (err) {
          console.error('Failed to initialize demo data:', err);
        }
      }
    };

    initializeDemoData();
  }, [isLoading, notes.length, folders.length, dbCreateNote, dbCreateFolder]);

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
      await dbCreateNote(note);
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await dbUpdateNote(noteId, updates);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await dbDeleteNote(noteId);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await dbCreateFolder({ name, color });
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await dbDeleteFolder(folderId);
      
      // Clear selection if deleted folder was selected
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  const handleImportData = async (data: ExportData) => {
    try {
      const result = await importData(data.notes, data.folders);
      return result;
    } catch (err) {
      console.error('Failed to import data:', err);
      throw err;
    }
  };

  // Clear error when user interacts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NotePocket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      <div className="lg:hidden">
        <div className="flex h-full flex-col">
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
          
          <main className="flex-1 overflow-auto p-4">
            <NotesGrid
              notes={filteredNotes()}
              viewMode={viewMode}
              folders={folders}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          </main>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex w-full h-full">
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
        />
        
        <div className="flex-1 flex flex-col">
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
          
          <main className="flex-1 overflow-auto p-6">
            <NotesGrid
              notes={filteredNotes()}
              viewMode={viewMode}
              folders={folders}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          </main>
        </div>
      </div>

      <CreateNoteModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateNote={handleCreateNote}
        folders={folders}
        selectedFolder={selectedFolder}
      />

      <Toaster />
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;