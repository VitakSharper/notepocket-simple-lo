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
  try {
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
  } catch (error) {
    console.error('JSON export failed:', error);
    throw new Error('Failed to export notes as JSON');
  }
}

/**
 * Export notes as PDF
 */
export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  try {
    if (notes.length === 0) {
      throw new Error('No notes to export');
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to wrap text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.4;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, y + (index * lineHeight));
    });
    
    return y + (lines.length * lineHeight);
  };

  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NotePocket Export', margin, yPosition);
  yPosition += 15;

  // Add export date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Exported on: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Create folder lookup for easier reference
  const folderMap = new Map(folders.map(f => [f.id, f]));

  // Group notes by folder
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

  // Add notes by folder
  for (const [folderId, folderNotes] of notesByFolder) {
    const folder = folderMap.get(folderId)!;
    
    checkPageBreak(20);
    
    // Folder header
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
  }

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
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export notes as PDF');
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
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Import notes from JSON backup
 */
export function parseJSONImport(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the structure
    if (!data.notes || !Array.isArray(data.notes) || !data.folders || !Array.isArray(data.folders)) {
      throw new Error('Invalid backup format');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse JSON import:', error);
    return null;
  }
}