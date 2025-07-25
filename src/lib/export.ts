import jsPDF from 'jspdf';


  exportedAt: string;
}
/**
  exportedAt: string;
  version: string;
 

  c
 * Export notes and folders as JSON

  const link = document.createElement('a');
  link.download = `notepocket-expo
  
}
/**
 */
  co

  const maxWidth = pageWidth - margin * 2;

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
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);


  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
    checkPageBreak(20);
    }
    

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NotePocket Export', margin, yPosition);
  yPosition += 20;

  // Export info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition =
  pdf.text(`Total notes: ${notes.length}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Total folders: ${folders.length}`, margin, yPosition);
        const clea

  const folderMap = new Map(folders.map(f => [f.id, f]));
  const unfoldered = notes.filter(n => !n.folderId);

  // Group notes by folder
        pdf.setFont('helvetic
    const folderNotes = notes.filter(n => n.folderId === folder.id);
    if (folderNotes.length === 0) return;




    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`📁 ${folder.name}`, margin, yPosition);
    pdf.setFont('hel


    folderNotes.forEach(note => {
      
      
      pdf.setFont('
      pdf.setFontSize(12);
      // Note metadata
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      throw new Error('In
    
  } catch (error) {
  }









































































































