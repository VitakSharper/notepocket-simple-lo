import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { Note, Folder } from '@/lib/types';

interface EditNoteModalProps {
  note: Note;
  folders: Folder[];
  open: boolean;
  onClose: () => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
}

export function EditNoteModal({
  note,
  folders,
  open,
  onClose,
  onUpdateNote,
}: EditNoteModalProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedFolderId, setSelectedFolderId] = useState(note.folderId || '');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setIsUpdating(true);

    try {
      await onUpdateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        folderId: selectedFolderId || null,
        tags,
      });
      onClose();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Note</DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Folder</InputLabel>
            <Select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              label="Folder"
            >
              <MenuItem value="">
                <em>No folder</em>
              </MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: folder.color
                      }}
                    />
                    {folder.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tags (press Enter to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            sx={{ mb: 1 }}
          />

          {tags.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => removeTag(tag)}
                />
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isUpdating || !title.trim()}
          >
            {isUpdating ? 'Updating...' : 'Update Note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}