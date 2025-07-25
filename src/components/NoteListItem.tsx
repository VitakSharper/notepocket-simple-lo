import { useState } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import {
  Description as FileTextIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Note, Folder } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { EditNoteModal } from './EditNoteModal';
import { NoteDetailModal } from './NoteDetailModal';

interface NoteListItemProps {
  note: Note;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function NoteListItem({ note, folders, onUpdateNote, onDeleteNote }: NoteListItemProps) {
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
        return <FileTextIcon />;
      case 'image':
        return <ImageIcon />;
      case 'file':
        return <FileIcon />;
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

  return (
    <>
      <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => setShowDetailModal(true)}
          sx={{ 
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
        >
          <ListItemIcon>
            {getTypeIcon()}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Typography variant="subtitle2" fontWeight="medium">
                {note.title}
              </Typography>
            }
            secondary={
              <Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5
                  }}
                >
                  {note.content || 'No content'}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(note.updatedAt)}
                  </Typography>
                  
                  {folder && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: folder.color
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {folder.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <Box display="flex" gap={0.5}>
                      {note.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6875rem', height: 16 }}
                        />
                      ))}
                      {note.tags.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{note.tags.length - 2}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            }
          />
          
          <ListItemSecondaryAction>
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
          </ListItemSecondaryAction>
        </ListItemButton>
      </ListItem>

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