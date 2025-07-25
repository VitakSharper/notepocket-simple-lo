import { useState, useRef, useCallback, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      setAspectRatio(naturalWidth / naturalHeight);
      
      // Set initial dimensions if not already set
      if (!image.width && !image.height) {
        const maxWidth = Math.min(naturalWidth, 600); // Default max width
        const calculatedHeight = maxWidth / (naturalWidth / naturalHeight);
        setDimensions({ width: maxWidth, height: calculatedHeight });
      }
    }
  }, [image.width, image.height, aspectRatio]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (!isEditable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPosition({ x: e.clientX, y: e.clientY });
    
    const currentWidth = dimensions.width || imageRef.current?.offsetWidth || 0;
    const currentHeight = dimensions.height || imageRef.current?.offsetHeight || 0;
    setStartDimensions({ width: currentWidth, height: currentHeight });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isEditable, dimensions]);

  // Handle mouse movement during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;
    
    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;

    switch (resizeHandle) {
      case 'se': // Southeast corner
        newWidth = Math.max(50, startDimensions.width + deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'sw': // Southwest corner
        newWidth = Math.max(50, startDimensions.width - deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'ne': // Northeast corner
        newWidth = Math.max(50, startDimensions.width + deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'nw': // Northwest corner
        newWidth = Math.max(50, startDimensions.width - deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'e': // East edge
        newWidth = Math.max(50, startDimensions.width + deltaX);
        newHeight = newWidth / aspectRatio;
        break;
      case 'w': // West edge
        newWidth = Math.max(50, startDimensions.width - deltaX);
        newHeight = newWidth / aspectRatio;
        break;
    }

    // Constrain to reasonable bounds
    newWidth = Math.min(Math.max(50, newWidth), naturalDimensions.width || 1000);
    newHeight = newWidth / aspectRatio;

    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, resizeHandle, startPosition, startDimensions, aspectRatio, naturalDimensions]);

  // Handle resize end
  const handleMouseUp = useCallback(() => {
    if (isResizing && onSizeChange && dimensions.width && dimensions.height) {
      onSizeChange(image.id, dimensions.width, dimensions.height);
    }
    
    setIsResizing(false);
    setResizeHandle(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [isResizing, onSizeChange, image.id, dimensions, handleMouseMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const imageStyle = {
    width: dimensions.width ? `${dimensions.width}px` : 'auto',
    height: dimensions.height ? `${dimensions.height}px` : 'auto',
    maxWidth: '100%',
  };

  return (
    <div className={`relative inline-block group ${className}`} ref={containerRef}>
      <img
        ref={imageRef}
        src={image.url}
        alt={altText || image.alt}
        style={imageStyle}
        onLoad={handleImageLoad}
        className="rounded-lg shadow-sm select-none"
        loading="lazy"
        draggable={false}
      />
      
      {isEditable && (
        <>
          {/* Resize handles */}
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          
          {/* Edge handles */}
          <div 
            className="absolute top-0 -right-1 w-3 h-full cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          >
            <div className="w-1 h-full bg-primary/50 mx-auto" />
          </div>
          <div 
            className="absolute top-0 -left-1 w-3 h-full cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          >
            <div className="w-1 h-full bg-primary/50 mx-auto" />
          </div>
          
          {/* Size indicator */}
          {isResizing && (
            <div className="absolute -top-8 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg">
              {Math.round(dimensions.width || 0)} × {Math.round(dimensions.height || 0)}
            </div>
          )}
        </>
      )}
      
      {(altText || image.alt) && (
        <p className="text-sm text-muted-foreground mt-2 italic">
          {altText || image.alt}
        </p>
      )}
    </div>
  );
}