import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SidebarInput } from '@/components/ui/sidebar';
import React from 'react';

interface SearchBarProps extends React.ComponentProps<'form'> {
  placeholder: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, size, ...props }) => {
  return (
    <form {...props}>
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <div className={size === 'sm' ? 'relative h-8' : size === "md" ? "relative h-12" : 'relative h-16'}>
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        <SidebarInput id="search" placeholder={placeholder} className="pl-8 h-full" />
      </div>
    </form>
  );
};

export default SearchBar;
