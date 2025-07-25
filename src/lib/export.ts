import jsPDF from 'jspdf';


export interface ExportData {
  notes: Note[];
  folders: Folder[];

  version: string;
 

   
 * Export notes and folders as JSON
   
export function exportAsJSON(notes: Note[], folders: Folder[]): void {
  const exportData: ExportData = {
    notes,
    folders,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {

  });

  const url = URL.createObjectURL(blob);
  const pageWidth = pdf.internal.pageSize.g
  link.href = url;
  link.download = `notepocket-export-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
 


 * Export notes and folders as PDF
   
export function exportAsPDF(notes: Note[], folders: Folder[]): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  pdf.setFont('helvetica', 'bold');
  let yPosition = margin;

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  yP

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();

    }
    

  // Title
  checkPageBreak(20);
    folderNotes.forEac
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
        yPosition = addWrappedText(cleanContent, margin + 5, yPosi
  yPosition += 20;

  const folderMap = new Map(folders.map(f => [f.id, f]));
      yPosition += 5;

    yPosition += 10;
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
      pdf.setFontSize(9);
      
      yPosition = a
      pdf.setFontSize(12);
      if (note.content && note.type ===
      yPosition = addWrappedText(note.title, margin + 5, yPosition, maxWidth - 5, 12) + 3;

      // Note metadata
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const metadata = `${note.type} • ${new Date(note.createdAt).toLocaleDateString()}${note.tags.length > 0 ? ' • ' + note.tags.join(', ') : ''}`;
      yPosition = addWrappedText(metadata, margin + 5, yPosition, maxWidth - 5, 9) + 5;

      // Note content
    pdf.save(`notepocket-export-${new Date().toIS
























































































