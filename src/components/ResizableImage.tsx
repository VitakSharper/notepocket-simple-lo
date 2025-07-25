import { useState, useRef, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { EmbeddedImage } from '@/lib/types';

interface ResizableImageProps {
  image: EmbeddedImage;
  altText?: string;
  isEditable?: boolean;
  onSizeChange?: (imageId: string, width: number, height: number) => void;
  className?: string;
}

export function ResizableImage({ 
  image, 
  altText, 
  isEditable = false, 
  onSizeChange,
  className = "" 
}: ResizableImageProps) {
  const [dimensions, setDimensions] = useState({
    width: typeof image.width === 'number' ? image.width : null,
    height: typeof image.height === 'number' ? image.height : null,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(1);
  
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      setAspectRatio(naturalWidth / naturalHeight);
      
      // Set initial dimensions if not already set
      if (!dimensions.width && !dimensions.height) {
        const maxWidth = 400;
        const width = Math.min(naturalWidth, maxWidth);
        const height = width / aspectRatio;
        setDimensions({ width, height });
      }
    }
  }, [dimensions.width, dimensions.height, aspectRatio]);

  // Mouse down handler for resize handles
  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    if (!isEditable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPosition({ x: e.clientX, y: e.clientY });
    setStartDimensions({
      width: dimensions.width || naturalDimensions.width,
      height: dimensions.height || naturalDimensions.height,
    });
  }, [isEditable, dimensions, naturalDimensions]);

  // Mouse move handler for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    
    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;
    
    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;
    
    switch (resizeHandle) {
      case 'se': // Southeast corner
        newWidth = Math.max(50, startDimensions.width + deltaX);
        newHeight = Math.max(50, startDimensions.height + deltaY);
        // Maintain aspect ratio when dragging corner
        if (e.shiftKey) {
          newHeight = newWidth / aspectRatio;
        }
        break;
      case 'e': // East side
        newWidth = Math.max(50, startDimensions.width + deltaX);
        break;
      case 's': // South side
        newHeight = Math.max(50, startDimensions.height + deltaY);
        break;
    }
    
    // Constrain to reasonable bounds
    newWidth = Math.min(newWidth, 800);
    newHeight = Math.min(newHeight, 600);
    
    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, resizeHandle, startPosition, startDimensions, aspectRatio]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (isResizing && onSizeChange && dimensions.width && dimensions.height) {
      onSizeChange(image.id, dimensions.width, dimensions.height);
    }
    setIsResizing(false);
    setResizeHandle(null);
  }, [isResizing, onSizeChange, dimensions, image.id]);

  // Add event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const imageStyle = {
    width: dimensions.width ? `${dimensions.width}px` : 'auto',
    height: dimensions.height ? `${dimensions.height}px` : 'auto',
    maxWidth: '100%',
    display: 'block',
    borderRadius: 4,
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: '100%',
        ...(isEditable && {
          '&:hover .resize-handle': {
            opacity: 1,
          },
        }),
      }}
      className={className}
    >
      <img
        ref={imageRef}
        src={image.data}
        alt={altText || 'Embedded image'}
        style={imageStyle}
        onLoad={handleImageLoad}
        draggable={false}
      />
      
      {isEditable && (
        <>
          {/* Southeast corner handle */}
          <Box
            className="resize-handle"
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 12,
              height: 12,
              bgcolor: 'primary.main',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'se-resize',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
          
          {/* East side handle */}
          <Box
            className="resize-handle"
            sx={{
              position: 'absolute',
              top: '50%',
              right: -4,
              width: 8,
              height: 20,
              bgcolor: 'primary.main',
              border: '1px solid white',
              borderRadius: 1,
              cursor: 'e-resize',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'e')}
          />
          
          {/* South side handle */}
          <Box
            className="resize-handle"
            sx={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              width: 20,
              height: 8,
              bgcolor: 'primary.main',
              border: '1px solid white',
              borderRadius: 1,
              cursor: 's-resize',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, 's')}
          />
        </>
      )}
    </Box>
  );
}