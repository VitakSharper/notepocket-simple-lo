import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  Paper,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as FileTextIcon,
  TableChart as TableIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { Note, Folder } from '@/lib/types';
import { exportAsJSON, exportAsCSV, parseImportData, ExportData } from '@/lib/export';

interface ExportDialogProps {
  notes: Note[];
  folders: Folder[];
  onImport?: (data: ExportData) => Promise<void>;
}

export function ExportDialog({ notes, folders, onImport }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = () => {
    try {
      if (notes.length === 0) {
        alert('No notes to export');
        return;
      }
      exportAsJSON(notes, folders);
      alert(`Exported ${notes.length} notes and ${folders.length} folders as JSON`);
      setIsOpen(false);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export notes as JSON: ' + (error as Error).message);
    }
  };

  const handleExportCSV = () => {
    try {
      if (notes.length === 0) {
        alert('No notes to export');
        return;
      }
      exportAsCSV(notes, folders);
      alert(`Exported ${notes.length} notes as CSV`);
      setIsOpen(false);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export notes as CSV: ' + (error as Error).message);
    }
  };

  const handleImport = async () => {
    if (!importFile || !onImport) return;

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      const data = parseImportData(fileContent);
      await onImport(data);
      alert(`Successfully imported ${data.notes.length} notes and ${data.folders.length} folders`);
      setIsOpen(false);
      setImportFile(null);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleMenuOpen}
      >
        Export
      </Button>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleExportJSON}>
          <FileTextIcon fontSize="small" sx={{ mr: 1 }} />
          Export as JSON
        </MenuItem>
        <MenuItem onClick={handleExportCSV}>
          <TableIcon fontSize="small" sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setIsOpen(true); }}>
          <UploadIcon fontSize="small" sx={{ mr: 1 }} />
          Import Data
        </MenuItem>
      </Menu>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Notes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import notes and folders from a previously exported JSON file.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Button
                component="span"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Select JSON File
              </Button>
            </label>
          </Box>

          {importFile && (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" fontWeight="medium">
                Selected file: {importFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(importFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importFile || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// For backward compatibility with components that use the old export dropdown
export function ExportDropdown({ notes, folders }: { notes: Note[]; folders: Folder[] }) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExportJSON = () => {
    try {
      if (notes.length === 0) {
        alert('No notes to export');
        return;
      }
      exportAsJSON(notes, folders);
      alert(`Exported ${notes.length} notes and ${folders.length} folders as JSON`);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export notes as JSON: ' + (error as Error).message);
    }
    handleMenuClose();
  };

  const handleExportCSV = () => {
    try {
      if (notes.length === 0) {
        alert('No notes to export');
        return;
      }
      exportAsCSV(notes, folders);
      alert(`Exported ${notes.length} notes as CSV`);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export notes as CSV: ' + (error as Error).message);
    }
    handleMenuClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleMenuOpen}
      >
        Export
      </Button>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleExportJSON}>
          <FileTextIcon fontSize="small" sx={{ mr: 1 }} />
          Export as JSON
        </MenuItem>
        <MenuItem onClick={handleExportCSV}>
          <TableIcon fontSize="small" sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
      </Menu>
    </>
  );
}