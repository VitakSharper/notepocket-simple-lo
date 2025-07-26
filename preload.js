const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getNotes: () => ipcRenderer.invoke('db-get-notes'),
  getFolders: () => ipcRenderer.invoke('db-get-folders'),
  createNote: (note) => ipcRenderer.invoke('db-create-note', note),
  updateNote: (noteId, updates) => ipcRenderer.invoke('db-update-note', noteId, updates),
  deleteNote: (noteId) => ipcRenderer.invoke('db-delete-note', noteId),
  createFolder: (folder) => ipcRenderer.invoke('db-create-folder', folder),
  deleteFolder: (folderId) => ipcRenderer.invoke('db-delete-folder', folderId),
  importData: (notes, folders) => ipcRenderer.invoke('db-import-data', notes, folders),
  
  // File operations
  saveFile: (defaultPath, filters, data) => ipcRenderer.invoke('save-file', defaultPath, filters, data),
  openFile: (filters) => ipcRenderer.invoke('open-file', filters),
  
  // Utility
  isElectron: true
});