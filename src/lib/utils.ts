import { Note, Folder } from './types';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate unique IDs
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date formatter
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString();
};

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Check if file is an image
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Check if file is a PDF
export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

// Get note type icon name for Phosphor icons
export const getNoteTypeIcon = (type: Note['type']): string => {
  switch (type) {
    case 'text':
      return 'FileText';
    case 'image':
      return 'Image';
    case 'file':
      return 'File';
    default:
      return 'File';
  }
};

// Search notes by query
export const searchNotes = (notes: Note[], query: string): Note[] => {
  if (!query.trim()) return notes;
  
  const searchTerm = query.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm) ||
    note.content.toLowerCase().includes(searchTerm) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    note.fileName?.toLowerCase().includes(searchTerm)
  );
};

// Filter notes by various criteria
export const filterNotes = (notes: Note[], filters: {
  type?: Note['type'];
  folderId?: string;
  tags?: string[];
  favorites?: boolean;
}): Note[] => {
  return notes.filter(note => {
    if (filters.type && note.type !== filters.type) return false;
    if (filters.folderId && note.folderId !== filters.folderId) return false;
    if (filters.favorites && !note.isFavorite) return false;
    if (filters.tags && filters.tags.length > 0) {
      return filters.tags.every(tag => note.tags.includes(tag));
    }
    return true;
  });
};

// Sort notes by various criteria
export const sortNotes = (notes: Note[], sortBy: 'date' | 'title' | 'type'): Note[] => {
  return [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
};

// Extract text content for search from different note types
export const extractSearchableContent = (note: Note): string => {
  let content = `${note.title} ${note.content} ${note.tags.join(' ')}`;
  if (note.fileName) {
    content += ` ${note.fileName}`;
  }
  return content.toLowerCase();
};

// Validate file type for upload
export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/markdown'
  ];
  
  return allowedTypes.includes(file.type);
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};