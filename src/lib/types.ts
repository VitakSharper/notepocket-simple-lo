export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'file';
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
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