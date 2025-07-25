import { Note, Folder, ViewMode } from '@/lib/types';
import { NoteCard } from './NoteCard';
import { NoteListItem } from './NoteListItem';

interface NotesGridProps {
  notes: Note[];
  viewMode: ViewMode;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesGrid({
  notes,
  viewMode,
  folders,
  onUpdateNote,
  onDeleteNote,
}: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-foreground">No notes yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start capturing your thoughts, images, and files. Your first note is just a click away.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            folders={folders}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          folders={folders}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      ))}
    </div>
  );
}