import { EmbeddedImage } from '@/lib/types';

interface NoteContentRendererProps {
  content: string;
  embeddedImages?: EmbeddedImage[];
  className?: string;
}

export function NoteContentRenderer({ 
  content, 
  embeddedImages = [], 
  className = "" 
}: NoteContentRendererProps) {
  const renderContentWithImages = () => {
    if (!content) return null;

    // Split content by embedded image references
    const parts = content.split(/(!\[[^\]]*\]\(embedded:[^)]+\))/);
    
    return parts.map((part, index) => {
      // Check if this part is an embedded image reference
      const imageMatch = part.match(/!\[([^\]]*)\]\(embedded:([^)]+)\)/);
      
      if (imageMatch) {
        const [, altText, imageId] = imageMatch;
        const image = embeddedImages.find(img => img.id === imageId);
        
        if (image) {
          return (
            <div key={index} className="my-4">
              <img
                src={image.url}
                alt={altText || image.alt}
                className="max-w-full rounded-lg shadow-sm"
                loading="lazy"
              />
              {(altText || image.alt) && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  {altText || image.alt}
                </p>
              )}
            </div>
          );
        } else {
          // Image not found, show placeholder
          return (
            <div key={index} className="my-4 p-4 border border-dashed border-muted-foreground/30 rounded-lg text-center text-muted-foreground">
              <p className="text-sm">Image not found: {altText || 'Untitled'}</p>
            </div>
          );
        }
      }
      
      // Regular text content - process basic markdown
      return (
        <div key={index} className="whitespace-pre-wrap">
          {processBasicMarkdown(part)}
        </div>
      );
    });
  };

  const processBasicMarkdown = (text: string) => {
    if (!text) return null;

    // Simple markdown processing for common patterns
    let processed = text;
    
    // Bold text (**text** or __text__)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic text (*text* or _text_)
    processed = processed.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
    processed = processed.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // Code inline (`code`)
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
    
    // Links [text](url)
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  return (
    <div className={className}>
      {renderContentWithImages()}
    </div>
  );
}