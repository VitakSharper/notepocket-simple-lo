import { useState, useRef } from 'react';
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
  Typography,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Description as FileTextIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Upload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Note, Folder, EmbeddedImage } from '@/lib/types';
import { validateFileType, fileToBase64, formatFileSize } from '@/lib/utils';

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  folders: Folder[];
  selectedFolder: string | null;
}

type NoteType = 'text' | 'image' | 'file';

export function CreateNoteModal({
  open,
  onOpenChange,
  onCreateNote,
  folders,
  selectedFolder,
}: CreateNoteModalProps) {
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(selectedFolder || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [embeddedImages, setEmbeddedImages] = useState<EmbeddedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNoteType('text');
    setTitle('');
    setContent('');
    setSelectedFolderId(selectedFolder || '');
    setTags([]);
    setTagInput('');
    setFile(null);
    setFilePreview(null);
    setEmbeddedImages([]);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    try {
      if (!validateFileType(selectedFile)) {
        alert('Unsupported file type');
        return;
      }

      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        const preview = await fileToBase64(selectedFile);
        setFilePreview(preview);
        setNoteType('image');
        
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        setNoteType('file');
        if (!title) {
          setTitle(selectedFile.name);
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

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

    setIsUploading(true);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileMimeType: string | undefined;

      if (file) {
        fileUrl = await fileToBase64(file);
        fileName = file.name;
        fileSize = file.size;
        fileMimeType = file.type;
      }

      const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        content: content.trim(),
        type: noteType,
        tags,
        folderId: selectedFolderId || null,
        isFavorite: false,
        fileUrl,
        fileName,
        fileSize,
        fileMimeType,
        embeddedImages,
      };

      await onCreateNote(newNote);
      handleClose();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create New Note
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Note Type
            </Typography>
            <ToggleButtonGroup
              value={noteType}
              exclusive
              onChange={(_, value) => value && setNoteType(value)}
              size="small"
            >
              <ToggleButton value="text">
                <FileTextIcon sx={{ mr: 1 }} />
                Text
              </ToggleButton>
              <ToggleButton value="image">
                <ImageIcon sx={{ mr: 1 }} />
                Image
              </ToggleButton>
              <ToggleButton value="file">
                <FileIcon sx={{ mr: 1 }} />
                File
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          {(noteType === 'image' || noteType === 'file') && (
            <Box sx={{ mb: 2 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept={noteType === 'image' ? 'image/*' : '*'}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileSelect(selectedFile);
                  }
                }}
                style={{ display: 'none' }}
              />
              
              {!file ? (
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.50'
                    }
                  }}
                  onClick={handleFileUpload}
                >
                  <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1">
                    Click to select {noteType === 'image' ? 'an image' : 'a file'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {noteType === 'image' ? 'PNG, JPG, WebP' : 'Any file type'}
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ p: 2, position: 'relative' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {filePreview && noteType === 'image' ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <FileIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
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
          <Button onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isUploading || !title.trim()}
          >
            {isUploading ? 'Creating...' : 'Create Note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}