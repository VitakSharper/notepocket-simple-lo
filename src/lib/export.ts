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
 * Export notes and folders as PDF
 */
export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  try {
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
      return y + (lines.length * fontSize * 0.352777778); // Convert pt to mm
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number): void => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NotePocket Export', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    pdf.text(`Total Notes: ${notes.length}`, margin, yPosition + 5);
    yPosition += 20;

    // Export by folder
    folders.forEach(folder => {
      const folderNotes = notes.filter(n => n.folderId === folder.id);
      if (folderNotes.length === 0) return;

      checkPageBreak(30);
      
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

    // Save the PDF
    const fileName = `notepocket-export-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Export PDF failed:', error);
    throw new Error('Failed to export notes as PDF: ' + (error as Error).message);
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
}      note.folderId ? `"${(folderMap.get(note.folderId) || '').replace(/"/g, '""')}"` : '',
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