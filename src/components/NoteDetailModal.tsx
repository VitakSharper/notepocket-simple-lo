import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, StarFill, Edit, Trash, FileText, Image, File } from '@phosphor-icons/react';
import { Note, Folder } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { NoteContentRenderer } from './NoteContentRenderer';

interface NoteDetailModalProps {
  note: Note | null;
  folders: Folder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: () => void;
}

export function NoteDetailModal({
  note,
  folders,
  open,
  onOpenChange,
  onUpdateNote,
  onDeleteNote,
  onEditNote,
}: NoteDetailModalProps) {
  if (!note) return null;

  const folder = folders.find(f => f.id === note.folderId);

  const toggleFavorite = () => {
    onUpdateNote(note.id, { isFavorite: !note.isFavorite });
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    if (note.type === 'image' && note.fileUrl) {
      return (
        <div className="w-full max-w-2xl mx-auto">
          <img
            src={note.fileUrl}
            alt={note.title}
            className="w-full rounded-lg shadow-sm"
          />
        </div>
      );
    }

    if (note.type === 'file' && note.fileName) {
      return (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{note.fileName}</p>
            {note.fileSize && (
              <p className="text-sm text-muted-foreground">{formatFileSize(note.fileSize)}</p>
            )}
            {note.fileMimeType && (
              <p className="text-xs text-muted-foreground mt-1">{note.fileMimeType}</p>
            )}
          </div>
        </div>
      );
    }

    if (note.content) {
      return (
        <NoteContentRenderer
          content={note.content}
          embeddedImages={note.embeddedImages}
          className="prose prose-sm max-w-none"
        />
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-muted-foreground mt-1">
                {getTypeIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-left text-lg leading-tight">
                  {note.title}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Updated {formatDate(note.updatedAt)}</span>
                  {folder && (
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span>{folder.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
              >
                {note.isFavorite ? (
                  <StarFill className="h-4 w-4 text-accent" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditNote}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDeleteNote(note.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {renderContent()}
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}