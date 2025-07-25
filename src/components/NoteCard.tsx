import { useState } from 'react';
import { Star, StarFill, MoreHorizontal, FileText, Image, File, Trash, Edit } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Note, Folder } from '@/lib/types';
import { formatDate, formatFileSize, isImageFile } from '@/lib/utils';
import { EditNoteModal } from './EditNoteModal';
import { NoteContentRenderer } from './NoteContentRenderer';
import { NoteDetailModal } from './NoteDetailModal';

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteCard({ note, folders, onUpdateNote, onDeleteNote }: NoteCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3">
          <img
            src={note.fileUrl}
            alt={note.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (note.type === 'file' && note.fileName) {
      return (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md mb-3">
          <File className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{note.fileName}</p>
            {note.fileSize && (
              <p className="text-xs text-muted-foreground">{formatFileSize(note.fileSize)}</p>
            )}
          </div>
        </div>
      );
    }

    if (note.type === 'text' && note.content) {
      // For text notes, use the content renderer to handle embedded images
      return (
        <div className="mb-3">
          <NoteContentRenderer
            content={note.content}
            embeddedImages={note.embeddedImages}
            className="text-sm text-muted-foreground line-clamp-3"
          />
        </div>
      );
    }

    if (note.content) {
      return (
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {note.content}
        </p>
      );
    }

    return null;
  };

  return (
    <>
      <Card 
        className="group hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="text-muted-foreground mt-0.5">
                {getTypeIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 leading-5">
                  {note.title}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <StarFill className="h-3 w-3 text-accent" />
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
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="mr-2 h-4 w-4" />
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
        </CardHeader>
        
        <CardContent className="pt-0">
          {renderContent()}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
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
          </div>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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