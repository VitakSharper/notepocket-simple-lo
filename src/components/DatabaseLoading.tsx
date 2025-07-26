import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';

interface DatabaseLoadingProps {
  message?: string;
}

export function DatabaseLoading({ message = 'Loading NotePocket...' }: DatabaseLoadingProps) {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      height="100vh" 
      alignItems="center" 
      justifyContent="center" 
      bgcolor="background.default"
      p={4}
    >
      <Box textAlign="center" maxWidth={400}>
        <Box mb={3}>
          <StorageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        </Box>
        
        <CircularProgress sx={{ mb: 3 }} size={40} />
        
        <Typography variant="h6" gutterBottom color="text.primary">
          {message}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Initializing your local database...
        </Typography>
        
        <LinearProgress sx={{ width: '100%', borderRadius: 1 }} />
        
        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={2} border="1px solid" borderColor="divider">
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Privacy First:</strong> Your data is stored locally on your computer. 
            No cloud servers, no tracking - just your notes, securely on your device.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}