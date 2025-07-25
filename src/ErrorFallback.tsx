import { Box, Alert, Typography, Button } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <Box 
      display="flex" 
      height="100vh" 
      alignItems="center" 
      justifyContent="center" 
      bgcolor="background.default"
      p={3}
    >
      <Box width="100%" maxWidth={500}>
        <Alert 
          severity="error" 
          icon={<ErrorOutline />}
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Application Error
          </Typography>
          <Typography variant="body2">
            Something unexpected happened while running the application. The error details are shown below.
          </Typography>
        </Alert>
        
        <Box 
          bgcolor="grey.50" 
          border={1} 
          borderColor="grey.300"
          borderRadius={1} 
          p={2} 
          mb={3}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Error Details:
          </Typography>
          <Box 
            component="pre" 
            sx={{
              fontSize: '0.75rem',
              color: 'error.main',
              bgcolor: 'grey.100',
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: 'grey.300',
              overflow: 'auto',
              maxHeight: 128,
              fontFamily: 'monospace'
            }}
          >
            {error.message}
          </Box>
        </Box>
        
        <Button 
          onClick={resetErrorBoundary} 
          variant="outlined"
          fullWidth
          startIcon={<Refresh />}
        >
          Try Again
        </Button>
      </Box>
    </Box>
  );
};
