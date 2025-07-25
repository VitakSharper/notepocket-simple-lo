import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Note, Folder, EmbeddedImage } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'sonner';

interface EditNoteModalProps {
  note: Note;
  folders: Folder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
}

export function EditNoteModal({
  note,
  folders,
  open,
  onOpenChange,
  onUpdateNote,
}: EditNoteModalProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(note.folderId);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState('');
  const [embeddedImages, setEmbeddedImages] = useState<EmbeddedImage[]>(note.embeddedImages || []);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note.');
      return;
    }

    try {
      const updates: Partial<Note> = {
        title: title.trim(),
        content: content.trim(),
        folderId: selectedFolderId === 'none' ? undefined : selectedFolderId,
        tags,
        embeddedImages: note.type === 'text' ? embeddedImages : undefined,
      };

      await onUpdateNote(note.id, updates);
      toast.success('Note updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update note. Please try again.');
    }
  };

  // Reset form when note changes or modal opens
  useEffect(() => {
    if (open) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedFolderId(note.folderId);
      setTags(note.tags);
      setTagInput('');
      setEmbeddedImages(note.embeddedImages || []);
    }  
  }, [note, open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSubmit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Preview (if applicable) */}
          {note.type === 'image' && note.fileUrl && (
            <div className="border rounded-lg p-4">
              <img
                src={note.fileUrl}
                alt={note.title}
                className="max-w-full max-h-48 mx-auto rounded-md"
              />
            </div>
          )}

          {note.type === 'file' && note.fileName && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <span>📎</span>
                <span className="font-medium">{note.fileName}</span>
                {note.fileSize && (
                  <span className="text-muted-foreground">
                    ({(note.fileSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="mt-1"
            />
          </div>

          {/* Content (for text notes or additional description) */}
          <div>
            <label className="text-sm font-medium">
              {note.type === 'text' ? 'Content' : 'Description (Optional)'}
            </label>
            {note.type === 'text' ? (
              <RichTextEditor
                content={content}
                embeddedImages={embeddedImages}
                onContentChange={setContent}
                onEmbeddedImagesChange={setEmbeddedImages}
                placeholder="Write your note content..."
                rows={6}
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a description for this file..."
                rows={6}
                className="mt-1"
              />
            )}
          </div>

          {/* Folder Selection */}
          <div>
            <label className="text-sm font-medium">Folder</label>
            <Select 
              value={selectedFolderId || 'none'} 
              onValueChange={(value) => setSelectedFolderId(value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Press Cmd/Ctrl + Enter to save, Esc to cancel
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Update Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}