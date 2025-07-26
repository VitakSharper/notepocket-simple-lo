/**
 * Database Test Suite for NotePocket
 * Tests all CRUD operations with text, images, and files
 */

import { db } from '../lib/database';
import { Note, Folder, EmbeddedImage } from '../lib/types';

export class DatabaseTestSuite {
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting NotePocket Database Test Suite...');
    
    try {
      await db.init();
      await db.clearDatabase();
      
      await this.testFolderCRUD();
      await this.testTextNoteCRUD();
      await this.testImageNoteCRUD();
      await this.testFileNoteCRUD();
      await this.testEmbeddedImages();
      await this.testSearchOperations();
      await this.testFilterOperations();
      await this.testDatabaseMaintenance();
      
      console.log('✅ All database tests passed!');
    } catch (error) {
      console.error('❌ Database tests failed:', error);
      throw error;
    }
  }

  static async testFolderCRUD(): Promise<void> {
    console.log('📁 Testing Folder CRUD operations...');
    
    // CREATE
    const folder = await db.createFolder({
      name: 'Test Folder',
      color: '#ff6b6b',
    });
    
    console.assert(folder.id, 'Folder should have an ID');
    console.assert(folder.name === 'Test Folder', 'Folder name should match');
    console.assert(folder.color === '#ff6b6b', 'Folder color should match');
    
    // READ
    const allFolders = await db.getAllFolders();
    console.assert(allFolders.length === 1, 'Should have 1 folder');
    console.assert(allFolders[0].id === folder.id, 'Folder ID should match');
    
    // DELETE
    const deleteResult = await db.deleteFolder(folder.id);
    console.assert(deleteResult === true, 'Delete should return true');
    
    const remainingFolders = await db.getAllFolders();
    console.assert(remainingFolders.length === 0, 'Should have 0 folders after delete');
    
    console.log('✅ Folder CRUD tests passed');
  }

  static async testTextNoteCRUD(): Promise<void> {
    console.log('📝 Testing Text Note CRUD operations...');
    
    // CREATE
    const textNote = await db.createNote({
      title: 'Test Text Note',
      content: 'This is a test note with **markdown** content.',
      type: 'text',
      tags: ['test', 'markdown'],
      isFavorite: false,
    });
    
    console.assert(textNote.id, 'Note should have an ID');
    console.assert(textNote.type === 'text', 'Note type should be text');
    console.assert(textNote.tags.includes('test'), 'Note should have test tag');
    
    // READ
    const retrievedNote = await db.getNoteById(textNote.id);
    console.assert(retrievedNote !== null, 'Note should be retrievable');
    console.assert(retrievedNote!.title === 'Test Text Note', 'Note title should match');
    
    const allNotes = await db.getAllNotes();
    console.assert(allNotes.length === 1, 'Should have 1 note');
    
    // UPDATE
    const updatedNote = await db.updateNote(textNote.id, {
      title: 'Updated Text Note',
      isFavorite: true,
    });
    console.assert(updatedNote !== null, 'Update should return note');
    console.assert(updatedNote!.title === 'Updated Text Note', 'Title should be updated');
    console.assert(updatedNote!.isFavorite === true, 'Favorite should be updated');
    
    // DELETE
    const deleteResult = await db.deleteNote(textNote.id);
    console.assert(deleteResult === true, 'Delete should return true');
    
    const remainingNotes = await db.getAllNotes();
    console.assert(remainingNotes.length === 0, 'Should have 0 notes after delete');
    
    console.log('✅ Text Note CRUD tests passed');
  }

  static async testImageNoteCRUD(): Promise<void> {
    console.log('🖼️ Testing Image Note CRUD operations...');
    
    // Create a mock image file
    const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const imageNote = await db.createNote({
      title: 'Test Image Note',
      content: 'This note contains an image',
      type: 'image',
      tags: ['image', 'test'],
      isFavorite: false,
      fileUrl: mockImageData,
      fileName: 'test-image.png',
      fileSize: 1024,
      fileMimeType: 'image/png',
    });
    
    console.assert(imageNote.type === 'image', 'Note type should be image');
    console.assert(imageNote.fileUrl === mockImageData, 'File URL should match');
    console.assert(imageNote.fileName === 'test-image.png', 'File name should match');
    console.assert(imageNote.fileMimeType === 'image/png', 'MIME type should match');
    
    // Test retrieval
    const retrievedImageNote = await db.getNoteById(imageNote.id);
    console.assert(retrievedImageNote !== null, 'Image note should be retrievable');
    console.assert(retrievedImageNote!.fileUrl === mockImageData, 'Image data should be preserved');
    
    // Clean up
    await db.deleteNote(imageNote.id);
    
    console.log('✅ Image Note CRUD tests passed');
  }

  static async testFileNoteCRUD(): Promise<void> {
    console.log('📄 Testing File Note CRUD operations...');
    
    // Create a mock PDF file
    const mockPdfData = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKdHJhaWxlcgo8PAovUm9vdCAxIDAgUgo+PgolJUVPRg==';
    
    const fileNote = await db.createNote({
      title: 'Test PDF Note',
      content: 'This note contains a PDF file',
      type: 'file',
      tags: ['pdf', 'document'],
      isFavorite: false,
      fileUrl: mockPdfData,
      fileName: 'test-document.pdf',
      fileSize: 2048,
      fileMimeType: 'application/pdf',
    });
    
    console.assert(fileNote.type === 'file', 'Note type should be file');
    console.assert(fileNote.fileUrl === mockPdfData, 'File URL should match');
    console.assert(fileNote.fileName === 'test-document.pdf', 'File name should match');
    console.assert(fileNote.fileMimeType === 'application/pdf', 'MIME type should match');
    
    // Test retrieval
    const retrievedFileNote = await db.getNoteById(fileNote.id);
    console.assert(retrievedFileNote !== null, 'File note should be retrievable');
    console.assert(retrievedFileNote!.fileUrl === mockPdfData, 'File data should be preserved');
    
    // Clean up
    await db.deleteNote(fileNote.id);
    
    console.log('✅ File Note CRUD tests passed');
  }

  static async testEmbeddedImages(): Promise<void> {
    console.log('🖼️ Testing Embedded Images functionality...');
    
    const embeddedImages: EmbeddedImage[] = [
      {
        id: 'img-1',
        url: 'data:image/png;base64,test1',
        alt: 'Test Image 1',
        fileName: 'test1.png',
        fileSize: 512,
        width: 100,
        height: 100,
      },
      {
        id: 'img-2',
        url: 'data:image/png;base64,test2',
        alt: 'Test Image 2',
        fileName: 'test2.png',
        fileSize: 1024,
        width: 200,
        height: 150,
      },
    ];
    
    const textNoteWithImages = await db.createNote({
      title: 'Note with Embedded Images',
      content: 'This note has ![Test Image 1](embedded:img-1) and ![Test Image 2](embedded:img-2)',
      type: 'text',
      tags: ['images', 'embedded'],
      isFavorite: false,
      embeddedImages,
    });
    
    console.assert(textNoteWithImages.embeddedImages?.length === 2, 'Should have 2 embedded images');
    console.assert(textNoteWithImages.embeddedImages![0].id === 'img-1', 'First image ID should match');
    console.assert(textNoteWithImages.embeddedImages![1].width === 200, 'Second image width should match');
    
    // Test embedded image storage
    await db.storeEmbeddedImages(textNoteWithImages.id, embeddedImages);
    
    // Test updating embedded images
    const updatedImages = embeddedImages.map(img => ({
      ...img,
      width: img.width! * 2,
      height: img.height! * 2,
    }));
    
    await db.updateEmbeddedImages(textNoteWithImages.id, updatedImages);
    
    const updatedNote = await db.getNoteById(textNoteWithImages.id);
    console.assert(updatedNote?.embeddedImages![0].width === 200, 'Image width should be doubled');
    
    // Clean up
    await db.deleteNote(textNoteWithImages.id);
    
    console.log('✅ Embedded Images tests passed');
  }

  static async testSearchOperations(): Promise<void> {
    console.log('🔍 Testing Search operations...');
    
    // Create test notes
    const note1 = await db.createNote({
      title: 'JavaScript Tutorial',
      content: 'Learn JavaScript programming',
      type: 'text',
      tags: ['programming', 'javascript'],
      isFavorite: false,
    });
    
    const note2 = await db.createNote({
      title: 'Python Guide',
      content: 'Learn Python programming',
      type: 'text',
      tags: ['programming', 'python'],
      isFavorite: true,
    });
    
    const note3 = await db.createNote({
      title: 'Recipe Collection',
      content: 'My favorite recipes',
      type: 'text',
      tags: ['cooking', 'food'],
      isFavorite: false,
    });
    
    // Test search by title
    const titleSearch = await db.searchNotes('JavaScript');
    console.assert(titleSearch.length === 1, 'Should find 1 note by title');
    console.assert(titleSearch[0].id === note1.id, 'Should find correct note');
    
    // Test search by content
    const contentSearch = await db.searchNotes('programming');
    console.assert(contentSearch.length === 2, 'Should find 2 notes by content');
    
    // Test search by tags
    const tagSearch = await db.searchNotes('python');
    console.assert(tagSearch.length === 1, 'Should find 1 note by tag');
    
    // Test get notes by type
    const textNotes = await db.getNotesByType('text');
    console.assert(textNotes.length === 3, 'Should find 3 text notes');
    
    // Test get favorite notes
    const favoriteNotes = await db.getFavoriteNotes();
    console.assert(favoriteNotes.length === 1, 'Should find 1 favorite note');
    console.assert(favoriteNotes[0].id === note2.id, 'Should find correct favorite note');
    
    // Clean up
    await db.deleteNote(note1.id);
    await db.deleteNote(note2.id);
    await db.deleteNote(note3.id);
    
    console.log('✅ Search operations tests passed');
  }

  static async testFilterOperations(): Promise<void> {
    console.log('🔧 Testing Filter operations...');
    
    // Create a test folder
    const folder = await db.createFolder({
      name: 'Work Folder',
      color: '#4ecdc4',
    });
    
    // Create notes in different folders
    const note1 = await db.createNote({
      title: 'Work Note',
      content: 'Important work stuff',
      type: 'text',
      tags: ['work'],
      folderId: folder.id,
      isFavorite: false,
    });
    
    const note2 = await db.createNote({
      title: 'Personal Note',
      content: 'Personal thoughts',
      type: 'text',
      tags: ['personal'],
      isFavorite: true,
    });
    
    // Test get notes by folder
    const folderNotes = await db.getNotesByFolder(folder.id);
    console.assert(folderNotes.length === 1, 'Should find 1 note in folder');
    console.assert(folderNotes[0].id === note1.id, 'Should find correct note in folder');
    
    // Clean up
    await db.deleteNote(note1.id);
    await db.deleteNote(note2.id);
    await db.deleteFolder(folder.id);
    
    console.log('✅ Filter operations tests passed');
  }

  static async testDatabaseMaintenance(): Promise<void> {
    console.log('🔧 Testing Database maintenance...');
    
    // Create some test data
    const folder = await db.createFolder({ name: 'Test', color: '#333' });
    const note = await db.createNote({
      title: 'Test Note',
      content: 'Test content',
      type: 'text',
      tags: ['test'],
      isFavorite: false,
    });
    
    // Test database size
    const size = await db.getDatabaseSize();
    console.assert(size.notes === 1, 'Should have 1 note in database');
    console.assert(size.folders === 1, 'Should have 1 folder in database');
    
    // Test clear database
    await db.clearDatabase();
    
    const sizeAfterClear = await db.getDatabaseSize();
    console.assert(sizeAfterClear.notes === 0, 'Should have 0 notes after clear');
    console.assert(sizeAfterClear.folders === 0, 'Should have 0 folders after clear');
    
    console.log('✅ Database maintenance tests passed');
  }
}