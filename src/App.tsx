import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Note, Folder, SearchFilters, ViewMode, SortOption } from './lib/types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotesGrid } from './components/NotesGrid';
import { CreateNoteModal } from './components/CreateNoteModal';
import { Toaster } from './components/ui/sonner';
import { searchNotes, filterNotes, sortNotes } from './lib/utils';
import { demoNotes, demoFolders } from './lib/demoData';

function App() {
  const [notes, setNotes] = useKV<Note[]>('notes', []);
  const [folders, setFolders] = useKV<Folder[]>('folders', []);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<Note['type'] | null>(null);

  // Initialize with demo data on first visit
  useEffect(() => {
    if (notes.length === 0 && folders.length === 0) {
      setNotes(demoNotes);
      setFolders(demoFolders);
    }
  }, [notes.length, folders.length, setNotes, setFolders]);

  // Filter and search notes
  const filteredNotes = () => {
    let result = notes;
    
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

  const handleCreateNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes(currentNotes => [...currentNotes, newNote]);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(currentNotes => currentNotes.filter(note => note.id !== noteId));
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      createdAt: new Date(),
    };
    
    setFolders(currentFolders => [...currentFolders, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
    // Remove folder
    setFolders(currentFolders => currentFolders.filter(folder => folder.id !== folderId));
    
    // Remove folder reference from notes
    setNotes(currentNotes => 
      currentNotes.map(note => 
        note.folderId === folderId 
          ? { ...note, folderId: undefined }
          : note
      )
    );
    
    // Clear selection if deleted folder was selected
    if (selectedFolder === folderId) {
      setSelectedFolder(null);
    }
  };

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
    </div>
  );
}

export default App;