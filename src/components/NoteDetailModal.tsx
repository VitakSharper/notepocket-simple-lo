import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Note, Folder } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { NoteContentRenderer } from './NoteContentRenderer';
import { EditNoteModal } from './EditNoteModal';

interface NoteDetailModalProps {
  note: Note;
  folders: Folder[];
  open: boolean;
  onClose: () => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function NoteDetailModal({
  note,
  folders,
  open,
  onClose,
  onUpdateNote,
  onDeleteNote,
}: NoteDetailModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const folder = folders.find(f => f.id === note.folderId);

  const toggleFavorite = async () => {
    try {
      await onUpdateNote(note.id, { isFavorite: !note.isFavorite });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await onDeleteNote(note.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const renderContent = () => {
    if (note.type === 'image' && note.fileUrl) {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={note.fileUrl}
            alt={note.fileName || 'Note image'}
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
          {note.fileName && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {note.fileName}
            </Typography>
          )}
        </Box>
      );
    }

    if (note.type === 'file' && note.fileName) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            mb: 2
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            📎 {note.fileName}
          </Typography>
          {note.fileSize && (
            <Typography variant="caption" color="text.secondary">
              ({(note.fileSize / 1024).toFixed(1)} KB)
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <NoteContentRenderer
        content={note.content}
        embeddedImages={note.embeddedImages}
        isEditable={false}
      />
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Typography variant="h6" component="div" sx={{ flex: 1, pr: 2 }}>
              {note.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                size="small"
                onClick={toggleFavorite}
                color={note.isFavorite ? 'warning' : 'default'}
              >
                {note.isFavorite ? <StarIcon /> : <StarOutlineIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setShowEditModal(true)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDelete}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {renderContent()}

          {note.content && note.type !== 'text' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {note.content}
              </Typography>
            </Box>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tags:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {note.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {/* Metadata */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {formatDate(note.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Modified: {formatDate(note.updatedAt)}
            </Typography>
            {folder && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: folder.color
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {folder.name}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <EditNoteModal
        note={note}
        folders={folders}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateNote={onUpdateNote}
      />
    </>
  );
}