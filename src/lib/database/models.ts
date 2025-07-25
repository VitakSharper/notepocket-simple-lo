/**
 * Database models for NotePocket SQLite database
 */

export interface NoteModel {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'file';
  tags: string; // JSON string of array
  folder_id: string | null;
  is_favorite: number; // SQLite boolean (0 or 1)
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime_type: string | null;
  embedded_images: string | null; // JSON string of EmbeddedImage array
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface FolderModel {
  id: string;
  name: string;
  color: string;
  created_at: string; // ISO string
}

export interface EmbeddedImageModel {
  id: string;
  note_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  position: number; // Order in the note
  created_at: string; // ISO string
}

// Type conversion helpers
export const noteModelToNote = (model: NoteModel) => ({
  id: model.id,
  title: model.title,
  content: model.content,
  type: model.type as 'text' | 'image' | 'file',
  tags: model.tags ? JSON.parse(model.tags) : [],
  folderId: model.folder_id,
  isFavorite: Boolean(model.is_favorite),
  fileUrl: model.file_url,
  fileName: model.file_name,
  fileSize: model.file_size,
  fileMimeType: model.file_mime_type,
  embeddedImages: model.embedded_images ? JSON.parse(model.embedded_images) : [],
  createdAt: new Date(model.created_at),
  updatedAt: new Date(model.updated_at),
});

export const noteToNoteModel = (note: any): Omit<NoteModel, 'created_at' | 'updated_at'> => ({
  id: note.id,
  title: note.title,
  content: note.content,
  type: note.type,
  tags: JSON.stringify(note.tags || []),
  folder_id: note.folderId,
  is_favorite: note.isFavorite ? 1 : 0,
  file_url: note.fileUrl,
  file_name: note.fileName,
  file_size: note.fileSize,
  file_mime_type: note.fileMimeType,
  embedded_images: JSON.stringify(note.embeddedImages || []),
});

export const folderModelToFolder = (model: FolderModel) => ({
  id: model.id,
  name: model.name,
  color: model.color,
  createdAt: new Date(model.created_at),
});

export const folderToFolderModel = (folder: any): Omit<FolderModel, 'created_at'> => ({
  id: folder.id,
  name: folder.name,
  color: folder.color,
});