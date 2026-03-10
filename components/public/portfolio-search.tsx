'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PortfolioSearchProps {
  categories: Category[];
  searchTerm: string;
  selectedCategories: string[];
  onSearchChange: (term: string) => void;
  onCategoriesChange: (categories: string[]) => void;
}

export function PortfolioSearch({
  categories,
  searchTerm,
  selectedCategories,
  onSearchChange,
  onCategoriesChange,
}: PortfolioSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestedCategories = useMemo(() => {
    if (!inputValue.trim()) return [];
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedCategories.includes(cat._id || '')
    );
  }, [inputValue, categories, selectedCategories]);

  const showSuggestions = isOpen && inputValue.trim().length > 0 && suggestedCategories.length > 0;

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearchChange(value);
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectCategory = (cat: Category) => {
    onCategoriesChange([...selectedCategories, cat._id || '']);
    setInputValue('');
    onSearchChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveCategory = (catId: string) => {
    onCategoriesChange(selectedCategories.filter((id) => id !== catId));
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
    setInputValue('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputValue && selectedCategories.length > 0) {
      onCategoriesChange(selectedCategories.slice(0, -1));
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getCategoryName = (id: string) => {
    return categories.find((c) => c._id === id)?.name || id;
  };

  const hasActiveFilters = selectedCategories.length > 0 || inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div
        className={cn(
          'flex items-center flex-wrap gap-1.5 min-h-11 px-3 py-2 rounded-full border border-border bg-card shadow-sm transition-all',
          isOpen && 'ring-2 ring-primary/30 shadow-md'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />

        {selectedCategories.map((catId) => (
          <Badge
            key={catId}
            variant="secondary"
            className="gap-1 shrink-0 cursor-default rounded-full"
          >
            <Tag className="w-3 h-3" />
            {getCategoryName(catId)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCategory(catId);
              }}
              className="ml-0.5 hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedCategories.length > 0 ? 'Search projects...' : 'Search projects or categories...'}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-30 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <div className="p-1.5">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categories
            </p>
            {suggestedCategories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
