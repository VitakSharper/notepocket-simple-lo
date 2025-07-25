import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions,
  Typography, 
  IconButton, 
  Chip, 
  Menu, 
  MenuItem,
  Box
} from '@mui/material';
import { 
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  MoreVert as MoreVertIcon,
  Description as FileTextIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Note, Folder } from '@/lib/types';
import { formatDate, formatFileSize, isImageFile } from '@/lib/utils';
import { EditNoteModal } from './EditNoteModal';
import { NoteContentRenderer } from './NoteContentRenderer';
import { NoteDetailModal } from './NoteDetailModal';

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function NoteCard({ note, folders, onUpdateNote, onDeleteNote }: NoteCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const folder = folders.find(f => f.id === note.folderId);

  const toggleFavorite = async () => {
    try {
      await onUpdateNote(note.id, { isFavorite: !note.isFavorite });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'text':
        return <FileTextIcon fontSize="small" />;
      case 'image':
        return <ImageIcon fontSize="small" />;
      case 'file':
        return <FileIcon fontSize="small" />;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteNote(note.id);
    handleMenuClose();
  };

  const renderContent = () => {
    if (note.type === 'image' && note.fileUrl) {
      return (
        <Box
          sx={{
            aspectRatio: '16/9',
            bgcolor: 'grey.100',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={note.fileUrl}
            alt={note.fileName || 'Note image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </Box>
      );
    }

    if (note.type === 'file' && note.fileName) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            mb: 2
          }}
        >
          {isImageFile(note.fileName) ? <ImageIcon /> : <FileIcon />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {note.fileName}
            </Typography>
            {note.fileSize && (
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(note.fileSize)}
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    return (
      <NoteContentRenderer
        content={note.content}
        embeddedImages={note.embeddedImages}
        maxLines={3}
      />
    );
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
        onClick={() => setShowDetailModal(true)}
      >
        <CardContent sx={{ flex: 1, pb: 1 }}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, minWidth: 0 }}>
              {getTypeIcon()}
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {note.title}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
                color={note.isFavorite ? 'warning' : 'default'}
              >
                {note.isFavorite ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
              </IconButton>
              
              <IconButton
                size="small"
                onClick={handleMenuOpen}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          {renderContent()}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              ))}
              {note.tags.length > 3 && (
                <Chip
                  label={`+${note.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Typography variant="caption" color="text.secondary">
              {formatDate(note.updatedAt)}
            </Typography>
            
            {folder && (
              <Box display="flex" alignItems="center" gap={0.5}>
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
        </CardActions>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Modals */}
      <EditNoteModal
        note={note}
        folders={folders}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateNote={onUpdateNote}
      />

      <NoteDetailModal
        note={note}
        folders={folders}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
      />
    </>
  );
}