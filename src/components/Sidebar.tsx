import { useState } from 'react';
import { Plus, FolderSimple, Star, Trash, MoreHorizontal } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (folderId: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: (show: boolean) => void;
  noteCount: number;
  favoriteCount: number;
}

const FOLDER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function Sidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  showFavoritesOnly,
  onToggleFavorites,
  noteCount,
  favoriteCount,
}: SidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), selectedColor);
      setNewFolderName('');
      setSelectedColor(FOLDER_COLORS[0]);
      setShowCreateDialog(false);
    }
  };

  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">NotePocket</h1>
        <p className="text-sm text-muted-foreground mt-1">{noteCount} notes total</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {/* All Notes */}
        <Button
          variant={!selectedFolder && !showFavoritesOnly ? "secondary" : "ghost"}
          className="w-full justify-start h-10"
          onClick={() => {
            onSelectFolder(null);
            onToggleFavorites(false);
          }}
        >
          <FolderSimple className="mr-2 h-4 w-4" />
          All Notes
          <Badge variant="outline" className="ml-auto">
            {noteCount}
          </Badge>
        </Button>

        {/* Favorites */}
        <Button
          variant={showFavoritesOnly ? "secondary" : "ghost"}
          className="w-full justify-start h-10"
          onClick={() => {
            onSelectFolder(null);
            onToggleFavorites(true);
          }}
        >
          <Star className="mr-2 h-4 w-4" />
          Favorites
          <Badge variant="outline" className="ml-auto">
            {favoriteCount}
          </Badge>
        </Button>

        {/* Folders Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Choose a color:</p>
                    <div className="flex gap-2">
                      {FOLDER_COLORS.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-6 h-6 rounded-full border-2",
                            selectedColor === color ? "border-foreground" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Folder List */}
          <div className="space-y-1">
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <Button
                  variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                  className="flex-1 justify-start h-10 mr-1"
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onToggleFavorites(false);
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: folder.color }}
                  />
                  {folder.name}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteFolder(folder.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}