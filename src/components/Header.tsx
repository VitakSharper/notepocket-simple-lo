import { 
  AppBar, 
  Toolbar, 
  Box, 
  TextField, 
  IconButton, 
  Button, 
  Menu, 
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  List as ListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { ViewMode, SortOption, Note, Folder } from '@/lib/types';
import { ExportDropdown } from './ExportDialog';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCreateNote: () => void;
  notes: Note[];
  folders: Folder[];
}

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onCreateNote,
  notes,
  folders,
}: HeaderProps) {
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (sort: SortOption) => {
    onSortChange(sort);
    handleSortMenuClose();
  };

  return (
    <AppBar position="static" elevation={1} color="inherit">
      <Toolbar sx={{ gap: 2, py: 1 }}>
        {/* Search */}
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              },
            }}
          />
        </Box>

        {/* Controls */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Export - Hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ExportDropdown notes={notes} folders={folders} />
          </Box>

          {/* Sort - Hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SortIcon />}
              onClick={handleSortMenuOpen}
            >
              <Box sx={{ display: { xs: 'none', lg: 'inline' } }}>
                Sort by {sortBy}
              </Box>
              <Box sx={{ display: { xs: 'inline', lg: 'none' } }}>
                Sort
              </Box>
            </Button>
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleSortMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleSortChange('date')}>
                Date modified
              </MenuItem>
              <MenuItem onClick={() => handleSortChange('title')}>
                Title
              </MenuItem>
              <MenuItem onClick={() => handleSortChange('type')}>
                Type
              </MenuItem>
            </Menu>
          </Box>

          {/* View Mode - Hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Create Note */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateNote}
            sx={{ ml: { md: 1 } }}
          >
            <Box sx={{ display: { xs: 'none', md: 'inline' } }}>
              New Note
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}