import { Note, Folder } from './types';

export interface ExportData {
  notes: Note[];
  folders: Folder[];
  exportedAt: string;
  version: string;
}

/**
 * Export notes and folders as JSON
 */
export function exportAsJSON(notes: Note[], folders: Folder[]): void {
  try {
    const exportData: ExportData = {
      notes,
      folders,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notepocket-export-${new Date().toISOString().split('T')[0]}.json`;
    
    // Ensure the link is added to the document for some browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Export JSON failed:', error);
    throw new Error('Failed to export notes as JSON: ' + (error as Error).message);
  }
}

/**
 * Export notes as CSV
 */
export function exportAsCSV(notes: Note[], folders: Folder[]): void {
  try {
    // Create folder lookup map
    const folderMap = new Map(folders.map(f => [f.id, f.name]));

    // CSV headers
    const headers = ['Title', 'Content', 'Type', 'Folder', 'Tags', 'Favorite', 'Created At', 'Updated At'];
    
    // Convert notes to CSV rows
    const rows = notes.map(note => [
      `"${(note.title || '').replace(/"/g, '""')}"`, // Escape quotes
      `"${(note.content || '').replace(/<[^>]*>/g, '').replace(/"/g, '""')}"`, // Remove HTML tags and escape quotes
      note.type,
      note.folderId ? `"${(folderMap.get(note.folderId) || '').replace(/"/g, '""')}"` : '',
      `"${note.tags.join(', ').replace(/"/g, '""')}"`,
      note.isFavorite ? 'Yes' : 'No',
      new Date(note.createdAt).toISOString(),
      new Date(note.updatedAt).toISOString()
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notepocket-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Export CSV failed:', error);
    throw new Error('Failed to export notes as CSV: ' + (error as Error).message);
  }
}

/**
 * Import data from JSON export file
 */
export function parseImportData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data = JSON.parse(jsonString);
        
        if (!data.notes || !data.folders || !Array.isArray(data.notes) || !Array.isArray(data.folders)) {
          throw new Error('Invalid export file format');
        }
        
        const importData: ExportData = {
          notes: data.notes,
          folders: data.folders,
          exportedAt: data.exportedAt || new Date().toISOString(),
          version: data.version || '1.0'
        };
        
        resolve(importData);
      } catch (error) {
        reject(new Error('Failed to parse import file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };
    
    reader.readAsText(file);
  });
}