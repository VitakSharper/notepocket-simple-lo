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

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `notepocket-export-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export notes and folders as PDF
 */
export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
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
  yPosition += 8;
  pdf.text(`Total notes: ${notes.length}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Total folders: ${folders.length}`, margin, yPosition);
  yPosition += 20;

  const folderMap = new Map(folders.map(f => [f.id, f]));
  const unfoldered = notes.filter(n => !n.folderId);

  // Group notes by folder
  folders.forEach(folder => {
    const folderNotes = notes.filter(n => n.folderId === folder.id);
    if (folderNotes.length === 0) return;

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
 * Parse and validate imported JSON data
 */
export function parseJSONExport(jsonData: string): ExportData {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate structure
    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('Invalid export format: notes array missing');
    }
    
    if (!data.folders || !Array.isArray(data.folders)) {
      throw new Error('Invalid export format: folders array missing');
    }
    
    return data as ExportData;
  } catch (error) {
    throw new Error(`Failed to parse export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}