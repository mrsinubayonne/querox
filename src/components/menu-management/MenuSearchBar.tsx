import React, { useState, useEffect, useRef, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface Props {
  onChange: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
}

/**
 * Isolated, memoized search bar with internal state and debounce.
 * Parent re-renders never cause the input to lose focus because the
 * input's value lives entirely inside this component.
 */
const MenuSearchBarImpl: React.FC<Props> = ({
  onChange,
  placeholder = 'Rechercher un plat par nom, description ou catégorie...',
  initialValue = '',
  debounceMs = 200,
}) => {
  const [value, setValue] = useState(initialValue);
  const cbRef = useRef(onChange);

  useEffect(() => {
    cbRef.current = onChange;
  });

  useEffect(() => {
    const t = setTimeout(() => cbRef.current(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs]);

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border border-primary/20">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <Input
          type="text"
          inputMode="search"
          placeholder={placeholder}
          className="pl-12 pr-12 h-12 text-base bg-white shadow-sm border-primary/30 focus:border-primary"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const MenuSearchBar = memo(MenuSearchBarImpl);
MenuSearchBar.displayName = 'MenuSearchBar';
