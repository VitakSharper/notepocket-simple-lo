import { Plus, MagnifyingGlass, SquaresFour, List, SortAscending } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ViewMode, SortOption } from '@/lib/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCreateNote: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onCreateNote,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4 lg:p-6 gap-4">
        {/* Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort - Hidden on mobile */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAscending className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Sort by {sortBy}</span>
                  <span className="lg:hidden">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSortChange('date')}>
                  Date modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange('title')}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange('type')}>
                  Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Mode - Hidden on mobile */}
          <div className="hidden md:flex rounded-md border border-border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none border-0"
              onClick={() => onViewModeChange('grid')}
            >
              <SquaresFour className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none border-0"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Note */}
          <Button onClick={onCreateNote} size="sm" className="md:ml-2">
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">New Note</span>
          </Button>
        </div>
      </div>
    </header>
  );
}