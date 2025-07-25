import { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Divider,
  Menu,
  MenuItem,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Folder, Note } from '@/lib/types';
import { ExportDialog } from './ExportDialog';
import { ExportData } from '@/lib/export';

interface SidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (folderId: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: (show: boolean) => void;
  noteCount: number;
  favoriteCount: number;
  notes: Note[];
  onImport?: (data: ExportData) => Promise<void>;
}

const FOLDER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function Sidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  showFavoritesOnly,
  onToggleFavorites,
  noteCount,
  favoriteCount,
  notes,
  onImport,
}: SidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setSelectedColor(FOLDER_COLORS[0]);
      setShowCreateDialog(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folderId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedFolderId(folderId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedFolderId(null);
  };

  const handleDeleteFolder = () => {
    if (selectedFolderId) {
      onDeleteFolder(selectedFolderId);
      handleMenuClose();
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: 280, 
        bgcolor: 'background.paper', 
        borderRight: 1, 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          NotePocket
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {noteCount} notes total
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2 }}>
        <List sx={{ p: 0 }}>
          {/* All Notes */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={!selectedFolder && !showFavoritesOnly}
              onClick={() => {
                onSelectFolder(null);
                onToggleFavorites(false);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="All Notes" />
              <Chip 
                label={noteCount} 
                size="small" 
                variant="outlined"
                sx={{ minWidth: 'auto' }}
              />
            </ListItemButton>
          </ListItem>

          {/* Favorites */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={showFavoritesOnly}
              onClick={() => {
                onSelectFolder(null);
                onToggleFavorites(true);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary="Favorites" />
              <Chip 
                label={favoriteCount} 
                size="small" 
                variant="outlined"
                sx={{ minWidth: 'auto' }}
              />
            </ListItemButton>
          </ListItem>

          {/* Export & Import */}
          <ListItem sx={{ py: 2 }}>
            <Divider sx={{ width: '100%' }} />
          </ListItem>
          
          <ListItem disablePadding>
            <ExportDialog 
              notes={notes} 
              folders={folders} 
              onImport={onImport}
            />
          </ListItem>

          {/* Folders Section */}
          <ListItem sx={{ py: 2 }}>
            <Divider sx={{ width: '100%' }} />
          </ListItem>
          
          <ListItem sx={{ px: 0, pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
                Folders
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowCreateDialog(true)}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>

          {/* Folder List */}
          {folders.map((folder) => (
            <ListItem key={folder.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedFolder === folder.id}
                onClick={() => {
                  onSelectFolder(folder.id);
                  onToggleFavorites(false);
                }}
                sx={{ borderRadius: 1, pr: 1 }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: folder.color,
                      mr: 1
                    }}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name}
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: { flex: 1, minWidth: 0 }
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, folder.id)}
                  sx={{ p: 0.5 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Create Folder Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, pb: 2 }}>
            <TextField
              fullWidth
              label="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Choose a color:
            </Typography>
            <Box display="flex" gap={1} sx={{ mb: 3 }}>
              {FOLDER_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: selectedColor === color ? 2 : 1,
                    borderColor: selectedColor === color ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
            
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                variant="outlined" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCreateFolder} 
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Folder Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDeleteFolder} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}