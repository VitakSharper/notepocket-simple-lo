import { Box, Typography } from '@mui/material';
import { EmbeddedImage } from '@/lib/types';
import { ResizableImage } from './ResizableImage';

interface NoteContentRendererProps {
  content: string;
  embeddedImages?: EmbeddedImage[];
  className?: string;
  isEditable?: boolean;
  onImageSizeChange?: (imageId: string, width: number, height: number) => void;
  maxLines?: number;
}

export function NoteContentRenderer({ 
  content, 
  embeddedImages = [], 
  className = "",
  isEditable = false,
  onImageSizeChange,
  maxLines
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
            <Box key={index} sx={{ my: 2 }}>
              <ResizableImage
                image={image}
                altText={altText}
                isEditable={isEditable}
                onSizeChange={onImageSizeChange}
              />
            </Box>
          );
        } else {
          // Image not found, show placeholder
          return (
            <Box 
              key={index} 
              sx={{ 
                my: 2, 
                p: 2, 
                border: '2px dashed', 
                borderColor: 'grey.300', 
                borderRadius: 1, 
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography variant="body2">
                Image not found: {altText || 'Untitled'}
              </Typography>
            </Box>
          );
        }
      } else {
        // Regular text content
        return (
          <Typography 
            key={index} 
            variant="body2" 
            component="span"
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              ...(maxLines && {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              })
            }}
            className={className}
          >
            {part}
          </Typography>
        );
      }
    });
  };

  return (
    <Box sx={{ 
      color: 'text.secondary',
      '& > *:first-of-type': { mt: 0 },
      '& > *:last-child': { mb: 0 }
    }}>
      {renderContentWithImages()}
    </Box>
  );
}