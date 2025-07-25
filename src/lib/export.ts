import jsPDF from 'jspdf';
import { Note, Folder } from './types';

  exportedAt: string;
}
/**
  exportedAt: string;
  version: string;
}

/**
 * Export notes and folders as JSON
   
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
/**
  link.download = `notepocket-backup-${new Date().toISOString().split('T')[0]}.json`;
export function exportAsPDF(notes:
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
 

   
 * Export notes as PDF

export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  // Helper function to wrap text
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {

    if (note.folderId && 
     
    

  });
  // Add notes by folder
    const folder = folderMap.g
    checkPageBreak(20);
    // Folder header
    
    yPosition += 12;
    
      checkPageBreak(30);
      // Note title
      p

      pdf.setFontSize(8);
    

      if (note
        pdf.setFont('h
        if (cleanContent) {
        }


        pdf.setFont(
      }
      yPosition += 8; // Space betwee

  }

    checkPageBreak(20);
    pdf.setFontSize(16);


      checkPageBreak(30);
      // Note title


      pdf.setFontSize(8);
      const metaText = `Type: ${note.type} | C

      i
        pdf.setFont('helvetica', 'normal');
        if (
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
}


 * Format file size in human readable format

function formatFileSize(bytes: number): string {

  
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


    // Validate the structure
    if (!data.notes || !Array.isArray(data.notes) || !data.folders || !Array.isArray(data.folders)) {
      throw new Error('Invalid backup format');
    }
    
    return data;

    console.error('Failed to parse JSON import:', error);

  }
