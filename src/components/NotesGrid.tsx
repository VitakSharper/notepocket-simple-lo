import { Box, Typography, Grid, List } from '@mui/material';
import { Note, Folder, ViewMode } from '@/lib/types';
import { NoteCard } from './NoteCard';
import { NoteListItem } from './NoteListItem';

interface NotesGridProps {
  notes: Note[];
  viewMode: ViewMode;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
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
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="300px" 
        textAlign="center"
      >
        <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>
          📝
        </Typography>
        <Typography variant="h5" fontWeight="medium" color="text.primary" sx={{ mb: 1 }}>
          No notes yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
          Start capturing your thoughts, images, and files. Your first note is just a click away.
        </Typography>
      </Box>
    );
  }

  if (viewMode === 'list') {
    return (
      <List sx={{ width: '100%', p: 0 }}>
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            folders={folders}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
          />
        ))}
      </List>
    );
  }

  return (
    <Grid container spacing={2}>
      {notes.map((note) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={note.id}>
          <NoteCard
            note={note}
            folders={folders}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
          />
        </Grid>
      ))}
    </Grid>
  );
}