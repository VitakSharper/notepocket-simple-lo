import { useState, useRef, useCallback } from 'react';
import { Image, Link2, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmbeddedImage } from '@/lib/types';
import { fileToBase64, validateFileType, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  embeddedImages: EmbeddedImage[];
  onContentChange: (content: string) => void;
  onEmbeddedImagesChange: (images: EmbeddedImage[]) => void;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({
  content,
  embeddedImages,
  onContentChange,
  onEmbeddedImagesChange,
  placeholder = "Write your note content...",
  rows = 6,
}: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertImageAtCursor = useCallback((imageId: string, alt: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageMarkdown = `![${alt}](embedded:${imageId})`;
    
    const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
    onContentChange(newContent);

    // Reset cursor position after the inserted image
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
      textarea.focus();
    }, 0);
  }, [content, onContentChange]);

  const handleFileUpload = async (file: File) => {
    if (!validateFileType(file) || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for embedded images
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await fileToBase64(file);
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const alt = imageAlt || file.name.replace(/\.[^/.]+$/, '');

      const newImage: EmbeddedImage = {
        id: imageId,
        url,
        alt,
        fileName: file.name,
        fileSize: file.size,
      };

      onEmbeddedImagesChange([...embeddedImages, newImage]);
      insertImageAtCursor(imageId, alt);
      
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
      toast.success('Image added to note!');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlImage = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL.');
      return;
    }

    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const alt = imageAlt || 'Image';

    const newImage: EmbeddedImage = {
      id: imageId,
      url: imageUrl.trim(),
      alt,
      fileName: 'external-image',
      fileSize: 0,
    };

    onEmbeddedImagesChange([...embeddedImages, newImage]);
    insertImageAtCursor(imageId, alt);

    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
    toast.success('Image added to note!');
  };

  const removeEmbeddedImage = (imageId: string) => {
    // Remove from embedded images array
    onEmbeddedImagesChange(embeddedImages.filter(img => img.id !== imageId));
    
    // Remove from content
    const regex = new RegExp(`!\\[[^\\]]*\\]\\(embedded:${imageId}\\)`, 'g');
    onContentChange(content.replace(regex, ''));
  };

  const renderContentWithImages = () => {
    let processedContent = content;
    
    // Replace embedded image references with actual images
    embeddedImages.forEach(image => {
      const regex = new RegExp(`!\\[([^\\]]*)\\]\\(embedded:${image.id}\\)`, 'g');
      processedContent = processedContent.replace(regex, (match, altText) => {
        return `[IMAGE: ${altText || image.alt}]`;
      });
    });

    return processedContent;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Content</label>
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" type="button">
              <Image className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Image to Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Alt Text (Optional)</label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Upload Image</label>
                  <div className="mt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                      type="button"
                    >
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">or</div>

                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button onClick={handleUrlImage} disabled={!imageUrl.trim()} type="button">
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />

      {embeddedImages.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Embedded Images</label>
          <div className="grid grid-cols-2 gap-3">
            {embeddedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeEmbeddedImage(image.id)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  {image.alt}
                  {image.fileSize > 0 && (
                    <span className="ml-1">({formatFileSize(image.fileSize)})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Use Markdown syntax or add images using the button above. Images will be embedded in your note.
      </div>
    </div>
  );
}