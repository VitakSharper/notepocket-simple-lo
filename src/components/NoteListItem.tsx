import { useState } from 'react';
import { Star, DotsThree, FileText, Image, File, Trash, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Note, Folder } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { EditNoteModal } from './EditNoteModal';
import { NoteDetailModal } from './NoteDetailModal';
import { cn } from '@/lib/utils';

interface NoteListItemProps {
  note: Note;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteListItem({ note, folders, onUpdateNote, onDeleteNote }: NoteListItemProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const folder = folders.find(f => f.id === note.folderId);

  const toggleFavorite = () => {
    onUpdateNote(note.id, { isFavorite: !note.isFavorite });
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'text':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'image':
        return <Image className="h-4 w-4 text-muted-foreground" />;
      case 'file':
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPreview = () => {
    if (note.type === 'file' && note.fileName) {
      return `📎 ${note.fileName}${note.fileSize ? ` (${formatFileSize(note.fileSize)})` : ''}`;
    }
    return note.content?.substring(0, 100) + (note.content && note.content.length > 100 ? '...' : '') || '';
  };

  return (
    <>
      <div 
        className="group flex items-center gap-4 p-4 border border-border rounded-lg hover:shadow-sm transition-shadow bg-card cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Type Icon */}
        <div className="flex-shrink-0">
          {getTypeIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-medium text-sm truncate pr-2">
              {note.title}
            </h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
              >
                {note.isFavorite ? (
                  <Star className="h-3 w-3 text-accent" weight="fill" />
                ) : (
                  <Star className="h-3 w-3" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThree className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <PencilSimple className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {getPreview() && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {getPreview()}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatDate(note.updatedAt)}</span>
            
            {folder && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <span>{folder.name}</span>
              </div>
            )}
            
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span>Tags:</span>
                <div className="flex gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NoteDetailModal
        note={note}
        folders={folders}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
        onEditNote={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
      />

      <EditNoteModal
        note={note}
        folders={folders}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdateNote={onUpdateNote}
      />
    </>
  );
}