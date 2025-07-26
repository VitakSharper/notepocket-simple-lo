export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'file';
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  embeddedImages?: EmbeddedImage[];
}

export interface EmbeddedImage {
  id: string;
  url: string;
  alt: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date | string | number;
}

export interface SearchFilters {
  query: string;
  type?: 'text' | 'image' | 'file';
  folderId?: string;
  tags?: string[];
  favorites?: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'date' | 'title' | 'type';