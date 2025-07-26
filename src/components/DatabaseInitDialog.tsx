import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Storage as StorageIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Warning as WarningIcon,
  Memory as MemoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface DatabaseInitDialogProps {
  open: boolean;
  onInitialize: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function DatabaseInitDialog({
  open,
  onInitialize,
  isLoading,
  error
}: DatabaseInitDialogProps) {
  const [showFallbackOption, setShowFallbackOption] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const isFileSystemSupported = 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;

  // Show fallback option after 15 seconds of loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        setShowFallbackOption(true);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
      setShowFallbackOption(false);
    }
  }, [isLoading]);

  // Show fallback option immediately if there's an error
  useEffect(() => {
    if (error) {
      setShowFallbackOption(true);
    }
  }, [error]);

  const handleInitialize = async () => {
    try {
      setShowFallbackOption(false);
      setTimeoutReached(false);
      await onInitialize();
    } catch (err) {
      console.error('Failed to initialize:', err);
      setShowFallbackOption(true);
    }
  };

  const handleFallbackMode = () => {
    // Force fallback by triggering an error
    window.location.reload();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <StorageIcon color="primary" />
          <Typography variant="h6">
            Welcome to NotePocket
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body1" gutterBottom>
            NotePocket uses a local SQLite database file stored on your computer for maximum privacy and offline access.
          </Typography>
        </Box>

        {!isFileSystemSupported && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Browser not supported!</strong><br />
              Your browser doesn't support the File System Access API. Please use a modern browser like:
            </Typography>
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              <Chip label="Chrome 86+" size="small" />
              <Chip label="Edge 86+" size="small" />
              <Chip label="Safari 15.2+" size="small" />
            </Box>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {timeoutReached && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Taking longer than expected...</strong><br />
              This may be due to browser security settings or WASM loading issues.
            </Typography>
          </Alert>
        )}

        <Box 
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <WarningIcon color="info" fontSize="small" />
            What happens next?
          </Typography>

          <Box component="ul" sx={{ pl: 2, mt: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Existing users:</strong> You'll be prompted to select your existing NotePocket database file (.db)
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>New users:</strong> You'll choose where to save your new database file
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">
                Your data stays completely private on your computer - no cloud storage involved!
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box mt={3} display="flex" alignItems="center" gap={2}>
          <FolderOpenIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            Recommended location: Documents/NotePocket/
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box display="flex" flexDirection="column" width="100%" gap={2}>
          <Button
            onClick={handleInitialize}
            variant="contained"
            disabled={isLoading || !isFileSystemSupported}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CreateNewFolderIcon />}
            size="large"
            fullWidth
          >
            {isLoading ? 'Initializing...' : 'Initialize Database'}
          </Button>

          {showFallbackOption && (
            <Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
                Having trouble? Try these options:
              </Typography>
              <Box display="flex" gap={1} justifyContent="center">
                <Button
                  onClick={handleFallbackMode}
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                  disabled={isLoading}
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => window.location.href = window.location.href + '?fallback=true'}
                  variant="outlined" 
                  startIcon={<MemoryIcon />}
                  size="small"
                  disabled={isLoading}
                >
                  Use Memory Mode
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}