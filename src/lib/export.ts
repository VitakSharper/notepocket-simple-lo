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

  const link = document.createElement('a');
  link.download = `notepocket-expo
  
}
/**
 */
  };

  const maxWidth = pageWidth - (margin * 2);

  con

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

    


      if (note.content && note.type === 'text') {
        const cleanContent = note.content.replace(/<[^>]*>/
      } else if (not
        yPosition = addWr
     
    


  });
  // Notes without fol
  if (unfoldered.length > 0) {
    
    pdf.setFont('h

    unfoldered.f
      
      pdf.setFontSize(12);
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5,
      // Note met
      pdf.setFont('helvetica', 'normal');
      yPosition =
      // Note content
        pdf.setFon

        pdf.setFontSize(9);

        yPosition = addWrappedText(`
      
    });


/**

  const text = await
  
  if (!data.notes || !data.folders ||
  }
  return {

    version: data.version || '1.0
}






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