import jsPDF from 'jspdf';


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
expo

  const margin = 20;
  let yPosition = margin;
  
    const lines = pdf.splitTextToSize(te
    return y + (lines.length * fontSize * 0

  const checkPageBreak = (requiredHeight: number) => {
  
    }

  pdf.setFontSize(20);
  pdf.text('NotePocket Expo


  p
  pdf.text(`Total note

  const folderMap = new Map(folders.map(f => [f.id, f]));
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
    } else {
  let yPosition = margin;

  folders.forEach(folder => {
    if (folderNotes.length === 0) return;
    checkPageBreak(20);
    pdf.setFontSize(16);
    pdf.text(`📁 ${folder.name}`, margin, yPosi


  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      // Note metada
      pdf.setFont('helvet
     
    

        co
          yPosition = 
      }
      // File information for file notes
        pdf.setFon


    });
    yPosition += 5; // Space between 

  if (unfoldered.l
    
    pdf.setFont('h

    unfoldered.forEach(not
      
      pdf.setFontSize(12);
      yPosition = addWrappedText

      pdf.setFont('helvet
      yPosition = addWrappedText(metaText, margin + 5, y
      // Note content
        pdf.setFontSize(10);
      }
          yPosition = addWrappedText(cleanContent, 
      }
      // File information fo
     
     

    });

  pdf.save(`notepocket-export-${new Date().toISOString().sp


export function parseJS
    
    // Validate structur
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
  





