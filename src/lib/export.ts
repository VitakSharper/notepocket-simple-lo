import jsPDF from 'jspdf';
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
  const exportData: ExportData = {
    notes,
    folders,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `notepocket-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export notes as PDF
 */
export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.5);
  };

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NotePocket Export', margin, yPosition);
  yPosition += 20;

  // Export info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Total notes: ${notes.length} | Total folders: ${folders.length}`, margin, yPosition);
  yPosition += 20;

  // Group notes by folder
  const folderMap = new Map(folders.map(f => [f.id, f]));
  const notesByFolder = new Map<string, Note[]>();
  const unfoldered: Note[] = [];

  notes.forEach(note => {
    if (note.folderId && folderMap.has(note.folderId)) {
      if (!notesByFolder.has(note.folderId)) {
        notesByFolder.set(note.folderId, []);
      }
      notesByFolder.get(note.folderId)!.push(note);
    } else {
      unfoldered.push(note);
    }
  });

  // Add foldered notes
  folders.forEach(folder => {
    const folderNotes = notesByFolder.get(folder.id) || [];
    if (folderNotes.length === 0) return;

    checkPageBreak(20);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`📁 ${folder.name}`, margin, yPosition);
    yPosition += 12;

    // Add notes in this folder
    folderNotes.forEach(note => {
      checkPageBreak(30);
      
      // Note title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const metaText = `Type: ${note.type} | Created: ${new Date(note.createdAt).toLocaleDateString()} | Tags: ${note.tags.join(', ') || 'None'}`;
      yPosition = addWrappedText(metaText, margin + 5, yPosition, maxWidth - 5, 8) + 3;

      // Note content
      if (note.content) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const cleanContent = note.content.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
        if (cleanContent) {
          yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 10) + 5;
        }
      }

      // File information for file notes
      if (note.type === 'file' && note.fileName) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`File: ${note.fileName} (${formatFileSize(note.fileSize || 0)})`, margin + 5, yPosition, maxWidth - 5, 9) + 3;
      }

      yPosition += 8; // Space between notes
    });

    yPosition += 5; // Space between folders
  });

  // Add unfoldered notes
  if (unfoldered.length > 0) {
    checkPageBreak(20);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📝 Unfoldered Notes', margin, yPosition);
    yPosition += 12;

    unfoldered.forEach(note => {
      checkPageBreak(30);
      
      // Note title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const metaText = `Type: ${note.type} | Created: ${new Date(note.createdAt).toLocaleDateString()} | Tags: ${note.tags.join(', ') || 'None'}`;
      yPosition = addWrappedText(metaText, margin + 5, yPosition, maxWidth - 5, 8) + 3;

      // Note content
      if (note.content) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const cleanContent = note.content.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
        if (cleanContent) {
          yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 10) + 5;
        }
      }

      // File information for file notes
      if (note.type === 'file' && note.fileName) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(`File: ${note.fileName} (${formatFileSize(note.fileSize || 0)})`, margin + 5, yPosition, maxWidth - 5, 9) + 3;
      }

      yPosition += 8; // Space between notes
    });
  }

  // Save the PDF
  pdf.save(`notepocket-export-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Parse and validate JSON import data
 */
export function parseJSONImport(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data || typeof data !== 'object') {
      return null;
    }
    
    if (!Array.isArray(data.notes) || !Array.isArray(data.folders)) {
      return null;
    }
    
    // Validate notes structure
    for (const note of data.notes) {
      if (!note.id || !note.title || !note.type || !Array.isArray(note.tags)) {
        return null;
      }
    }
    
    // Validate folders structure
    for (const folder of data.folders) {
      if (!folder.id || !folder.name || !folder.color) {
        return null;
      }
    }
    
    return {
      notes: data.notes,
      folders: data.folders,
      exportedAt: data.exportedAt || new Date().toISOString(),
      version: data.version || '1.0',
    };
  } catch (error) {
    console.error('Failed to parse JSON import:', error);
    return null;
  }
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}