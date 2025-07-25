import { useState } from 'react';
import { Download, FileText, FilePdf, Upload } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Note, Folder } from '@/lib/types';
import { exportAsJSON, exportAsPDF, parseImportData, ExportData } from '@/lib/export';
import { toast } from 'sonner';

interface ExportDialogProps {
  notes: Note[];
  folders: Folder[];
  onImport?: (data: ExportData) => Promise<void>;
}

export function ExportDialog({ notes, folders, onImport }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = () => {
    try {
      exportAsJSON(notes, folders);
      toast.success('Notes exported as JSON successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export notes as JSON');
    }
  };

  const handleExportPDF = () => {
    try {
      exportAsPDF(notes, folders);
      toast.success('Notes exported as PDF successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export notes as PDF');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      toast.error('Please select a valid JSON backup file');
    }
  };

  const handleImport = async () => {
    if (!importFile || !onImport) return;

    setIsImporting(true);
    try {
      const jsonString = await importFile.text();
      const importData = parseImportData(jsonString);
      
      if (!importData) {
        toast.error('Invalid backup file format');
        return;
      }

      await onImport(importData);
      toast.success(`Imported ${importData.notes.length} notes and ${importData.folders.length} folders`);
      setIsOpen(false);
      setImportFile(null);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import backup file');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Backup & Restore</DialogTitle>
          <DialogDescription>
            Export your notes or import from a backup file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Export Notes</h3>
            <div className="space-y-2">
              <Button
                onClick={handleExportJSON}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export as JSON</div>
                  <div className="text-xs text-muted-foreground">
                    Complete backup with all data
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="w-full justify-start"
              >
                <FilePdf className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export as PDF</div>
                  <div className="text-xs text-muted-foreground">
                    Printable document format
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {onImport && (
            <>
              <Separator />
              
              {/* Import Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Import Backup</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="backup-file" className="text-sm">
                      Select JSON backup file
                    </Label>
                    <Input
                      id="backup-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>
                  
                  {importFile && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {importFile.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || isImporting}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Backup'}
                  </Button>
                  
                  {onImport && (
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Importing will add to your existing notes. Duplicates may be created.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          💡 JSON exports can be re-imported. PDF exports are for viewing and printing only.
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simplified export dropdown for the header
export function ExportDropdown({ notes, folders }: { notes: Note[]; folders: Folder[] }) {
  const handleExportJSON = () => {
    try {
      exportAsJSON(notes, folders);
      toast.success('Notes exported as JSON successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export notes');
    }
  };

  const handleExportPDF = () => {
    try {
      exportAsPDF(notes, folders);
      toast.success('Notes exported as PDF successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export notes');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FilePdf className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}