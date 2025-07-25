/**
 * Database initialization and demo setup
 */

import { databaseService } from './service';
import { demoNotes, demoFolders } from '../demoData';

export const initializeDemoData = async (): Promise<void> => {
  try {
    const existingNotes = await databaseService.getAllNotes();
    const existingFolders = await databaseService.getAllFolders();

    // Only initialize demo data if database is empty
    if (existingNotes.length === 0 && existingFolders.length === 0) {
      console.log('Initializing demo data...');

      // Create demo folders first
      for (const folder of demoFolders) {
        await databaseService.createFolder({
          name: folder.name,
          color: folder.color,
        });
      }

      // Then create demo notes
      for (const note of demoNotes) {
        await databaseService.createNote({
          title: note.title,
          content: note.content,
          type: note.type,
          tags: note.tags,
          folderId: note.folderId,
          isFavorite: note.isFavorite,
          fileUrl: note.fileUrl,
          fileName: note.fileName,
          fileSize: note.fileSize,
          fileMimeType: note.fileMimeType,
          embeddedImages: note.embeddedImages,
        });
      }

      console.log('Demo data initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
  }
};