import { useKV } from '@github/spark/hooks';
import { Note, Folder } from '../lib/types';
import { db } from '../lib/database';

/**
 * Migration service to transfer data from KV storage to SQLite database
 * This ensures users don't lose their existing data when upgrading
 */
export class MigrationService {
  private static hasRunMigration = false;

  static async migrateFromKV(): Promise<{ success: boolean; notesCount: number; foldersCount: number }> {
    if (this.hasRunMigration) {
      return { success: true, notesCount: 0, foldersCount: 0 };
    }

    try {
      // Check if we have existing KV data
      const kvNotes = await spark.kv.get<Note[]>('notes');
      const kvFolders = await spark.kv.get<Folder[]>('folders');

      if (!kvNotes?.length && !kvFolders?.length) {
        this.hasRunMigration = true;
        return { success: true, notesCount: 0, foldersCount: 0 };
      }

      console.log('Migrating data from KV storage to database...');

      let migratedNotesCount = 0;
      let migratedFoldersCount = 0;

      // Migrate folders first (since notes reference them)
      if (kvFolders?.length) {
        for (const folder of kvFolders) {
          try {
            await db.createFolder({
              name: folder.name,
              color: folder.color,
            });
            migratedFoldersCount++;
          } catch (error) {
            console.warn('Failed to migrate folder:', folder.name, error);
          }
        }
      }

      // Migrate notes
      if (kvNotes?.length) {
        for (const note of kvNotes) {
          try {
            await db.createNote({
              title: note.title,
              content: note.content,
              type: note.type,
              tags: note.tags || [],
              folderId: note.folderId,
              isFavorite: note.isFavorite || false,
              fileUrl: note.fileUrl,
              fileName: note.fileName,
              fileSize: note.fileSize,
              fileMimeType: note.fileMimeType,
              embeddedImages: note.embeddedImages || [],
            });
            migratedNotesCount++;
          } catch (error) {
            console.warn('Failed to migrate note:', note.title, error);
          }
        }
      }

      // Clear KV storage after successful migration
      if (migratedNotesCount > 0 || migratedFoldersCount > 0) {
        await spark.kv.delete('notes');
        await spark.kv.delete('folders');
        console.log(`Migration completed: ${migratedNotesCount} notes, ${migratedFoldersCount} folders`);
      }

      this.hasRunMigration = true;
      return { 
        success: true, 
        notesCount: migratedNotesCount, 
        foldersCount: migratedFoldersCount 
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, notesCount: 0, foldersCount: 0 };
    }
  }

  static async checkMigrationNeeded(): Promise<boolean> {
    try {
      const kvNotes = await spark.kv.get<Note[]>('notes');
      const kvFolders = await spark.kv.get<Folder[]>('folders');
      return Boolean(kvNotes?.length || kvFolders?.length);
    } catch {
      return false;
    }
  }

  static reset() {
    this.hasRunMigration = false;
  }
}