import { useState, useRef } from 'react';
import { FileText, Image, File, Upload, X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Note, Folder, EmbeddedImage } from '@/lib/types';
import { validateFileType, fileToBase64, formatFileSize } from '@/lib/utils';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'sonner';

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  folders: Folder[];
  selectedFolder: string | null;
}

type NoteType = 'text' | 'image' | 'file';

export function CreateNoteModal({
  open,
  onOpenChange,
  onCreateNote,
  folders,
  selectedFolder,
}: CreateNoteModalProps) {
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(selectedFolder || undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [embeddedImages, setEmbeddedImages] = useState<EmbeddedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNoteType('text');
    setTitle('');
    setContent('');
    setSelectedFolderId(selectedFolder || undefined);
    setTags([]);
    setTagInput('');
    setFile(null);
    setFilePreview(null);
    setEmbeddedImages([]);
    setIsUploading(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!validateFileType(selectedFile)) {
      toast.error('Unsupported file type. Please select an image, PDF, or text file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
    
    // Set title to filename if not already set
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
      setNoteType('image');
    } else {
      setNoteType('file');
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

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

    if ((noteType === 'image' || noteType === 'file') && !file) {
      toast.error('Please select a file.');
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let fileMimeType: string | undefined;

      if (file) {
        fileUrl = await fileToBase64(file);
        fileName = file.name;
        fileSize = file.size;
        fileMimeType = file.type;
      }

      const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        content: content.trim(),
        type: noteType,
        tags,
        folderId: selectedFolderId,
        isFavorite: false,
        fileUrl,
        fileName,
        fileSize,
        fileMimeType,
        embeddedImages: noteType === 'text' ? embeddedImages : undefined,
      };

      onCreateNote(newNote);
      toast.success('Note created successfully!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Note Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={noteType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNoteType('text')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button
              type="button"
              variant={noteType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setNoteType('image');
                fileInputRef.current?.click();
              }}
            >
              <Image className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              type="button"
              variant={noteType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setNoteType('file');
                fileInputRef.current?.click();
              }}
            >
              <File className="h-4 w-4 mr-2" />
              File
            </Button>
          </div>

          {/* File Upload Area */}
          {(noteType === 'image' || noteType === 'file') && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {file ? (
                <div className="space-y-4">
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-md"
                    />
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop your file here or{' '}
                    <button
                      type="button"
                      className="text-accent hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports images, PDFs, and text files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.md"
            onChange={handleFileInputChange}
            className="hidden"
          />

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
          {noteType === 'text' ? (
            <RichTextEditor
              content={content}
              embeddedImages={embeddedImages}
              onContentChange={setContent}
              onEmbeddedImagesChange={setEmbeddedImages}
              placeholder="Write your note content..."
              rows={6}
            />
          ) : (
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a description for this file..."
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* Folder Selection */}
          <div>
            <label className="text-sm font-medium">Folder (Optional)</label>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
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
            <label className="text-sm font-medium">Tags (Optional)</label>
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}