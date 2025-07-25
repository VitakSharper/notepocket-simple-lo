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
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    pdf.setFontSize(fontSize);
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
  pdf.setFontSize(18);
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

  // Process folders and their notes
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
      checkPageBreak(50);
      
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
        pdf.setFontSize(9);
        const cleanContent = note.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 9);
      } else if (note.type === 'file' && note.fileName) {
        pdf.setFontSize(9);
        yPosition = addWrappedText(`File: ${note.fileName}`, margin + 5, yPosition, maxWidth - 5, 9);
      } else if (note.type === 'image' && note.fileName) {
        pdf.setFontSize(9);
        yPosition = addWrappedText(`Image: ${note.fileName}`, margin + 5, yPosition, maxWidth - 5, 9);
      }
      
      yPosition += 10;
    });

    yPosition += 10;
  });

  // Notes without folders
  const unfoldered = notes.filter(n => !n.folderId);
  if (unfoldered.length > 0) {
    checkPageBreak(30);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📝 Unfiled Notes', margin, yPosition);
    yPosition += 15;

    unfoldered.forEach(note => {
      checkPageBreak(50);
      
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
        pdf.setFontSize(9);
        const cleanContent = note.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        yPosition = addWrappedText(cleanContent, margin + 5, yPosition, maxWidth - 5, 9);
      } else if (note.type === 'file' && note.fileName) {
        pdf.setFontSize(9);
        yPosition = addWrappedText(`File: ${note.fileName}`, margin + 5, yPosition, maxWidth - 5, 9);
      } else if (note.type === 'image' && note.fileName) {
        pdf.setFontSize(9);
        yPosition = addWrappedText(`Image: ${note.fileName}`, margin + 5, yPosition, maxWidth - 5, 9);
      }
      
      yPosition += 10;
    });
  }

  pdf.save(`notepocket-export-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Parse imported JSON data
 */
export async function parseImportData(file: File): Promise<ExportData> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validate the imported data structure
  if (!data.notes || !data.folders || !Array.isArray(data.notes) || !Array.isArray(data.folders)) {
    throw new Error('Invalid import file format');
  }
  
  return {
    notes: data.notes,
    folders: data.folders,
    exportedAt: data.exportedAt || new Date().toISOString(),
    version: data.version || '1.0.0'
  };
}