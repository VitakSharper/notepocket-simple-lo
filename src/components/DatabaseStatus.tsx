import { Chip, Box } from '@mui/material';
import { Storage, CloudOff } from '@mui/icons-material';

interface DatabaseStatusProps {
  status?: { usingSqlite: boolean; initialized: boolean };
}

export function DatabaseStatus({ status }: DatabaseStatusProps) {
  if (!status) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}>
      <Chip
        icon={status.usingSqlite ? <Storage /> : <CloudOff />}
        label={status.usingSqlite ? 'SQLite Database' : 'Demo Mode'}
        color={status.usingSqlite ? 'success' : 'warning'}
        variant="filled"
        size="small"
        sx={{
          '& .MuiChip-label': {
            fontSize: '0.75rem'
          }
        }}
      />
    </Box>
  );
}