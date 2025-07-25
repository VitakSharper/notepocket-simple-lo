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
    version: '1.0.0'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
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
  checkPageBreak(20);
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

    checkPageBreak(30);

    // Folder header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`📁 ${folder.name}`, margin, yPosition);
    yPosition += 15;

    folderNotes.forEach(note => {
      checkPageBreak(40);
      
      // Note title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const metadata = `${note.type} • ${new Date(note.createdAt).toLocaleDateString()}${note.tags.length > 0 ? ' • ' + note.tags.join(', ') : ''}`;
      yPosition = addWrappedText(metadata, margin + 5, yPosition, maxWidth - 5, 9) + 5;

      // Note content
      if (note.content && note.type === 'text') {
        pdf.setFontSize(10);
        const cleanContent = note.content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
        yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 10) + 10;
      } else if (note.type === 'image' || note.type === 'file') {
        pdf.setFontSize(10);
        yPosition = addWrappedText(`[${note.type.toUpperCase()}] ${note.fileName || 'Untitled'}`, margin + 5, yPosition, maxWidth - 5, 10) + 10;
      }

      yPosition += 5;
    });

    yPosition += 10;
  });

  // Unfoldered notes
  if (unfoldered.length > 0) {
    checkPageBreak(30);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📄 Unfoldered Notes', margin, yPosition);
    yPosition += 15;

    unfoldered.forEach(note => {
      checkPageBreak(40);
      
      // Note title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const metadata = `${note.type} • ${new Date(note.createdAt).toLocaleDateString()}${note.tags.length > 0 ? ' • ' + note.tags.join(', ') : ''}`;
      yPosition = addWrappedText(metadata, margin + 5, yPosition, maxWidth - 5, 9) + 5;

      // Note content
      if (note.content && note.type === 'text') {
        pdf.setFontSize(10);
        const cleanContent = note.content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
        yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 10) + 10;
      } else if (note.type === 'image' || note.type === 'file') {
        pdf.setFontSize(10);
        yPosition = addWrappedText(`[${note.type.toUpperCase()}] ${note.fileName || 'Untitled'}`, margin + 5, yPosition, maxWidth - 5, 10) + 10;
      }

      yPosition += 5;
    });
  }

  // Save the PDF
  try {
    pdf.save(`notepocket-export-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to save PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Import data from JSON export
 */
export function parseImportData(jsonString: string): ExportData {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the import data structure
    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('Invalid import data: missing or invalid notes array');
    }
    
    if (!data.folders || !Array.isArray(data.folders)) {
      throw new Error('Invalid import data: missing or invalid folders array');
    }
    
    return {
      notes: data.notes,
      folders: data.folders,
      exportedAt: data.exportedAt || new Date().toISOString(),
      version: data.version || '1.0.0'
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}