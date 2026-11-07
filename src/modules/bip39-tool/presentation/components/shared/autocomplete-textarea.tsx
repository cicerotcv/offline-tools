import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '$/components/ui/popover';
import { SecretTextarea } from '$/components/ui/secret-field';

import { getAutocompleteSuggestions } from '../../../lib/wordlist';

interface AutocompleteTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function AutocompleteTextarea({
  value,
  onChange,
  placeholder,
  className,
  id,
}: AutocompleteTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Extract the current word being typed
  const extractCurrentWord = useCallback((text: string, cursorPos: number) => {
    // Find the start of the current word
    let start = cursorPos;
    while (start > 0 && /\S/.test(text[start - 1])) {
      start--;
    }

    // Find the end of the current word
    let end = cursorPos;
    while (end < text.length && /\S/.test(text[end])) {
      end++;
    }

    const word = text.slice(start, end).toLowerCase().trim();
    return { word, start, end };
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;

      onChange(newValue);

      // Extract current word
      const { word } = extractCurrentWord(newValue, cursorPos);

      if (word.length > 0) {
        const suggestions = getAutocompleteSuggestions(word, 8);
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setSelectedIndex(0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [onChange, extractCurrentWord]
  );

  // Insert suggestion into textarea
  const insertSuggestion = useCallback(
    (suggestion: string) => {
      if (!textareaRef.current) return;

      const text = value;
      const { start, end } = extractCurrentWord(
        text,
        textareaRef.current.selectionStart
      );

      // Replace current word with suggestion
      const newText = text.slice(0, start) + suggestion + ' ' + text.slice(end);
      onChange(newText);

      // Set cursor position after the inserted word
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + suggestion.length + 1;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);

      setShowSuggestions(false);
      setSuggestions([]);
    },
    [value, onChange, extractCurrentWord]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle space key - complete word with first suggestion if available
      if (e.key === ' ') {
        if (showSuggestions && suggestions.length > 0 && textareaRef.current) {
          // Verify we're actually at the end of a word that needs completion
          const cursorPos = textareaRef.current.selectionStart;
          const { word } = extractCurrentWord(value, cursorPos);

          // Only complete if we have a partial word (not empty, not already complete)
          if (
            word.length > 0 &&
            suggestions.some((s) => s.startsWith(word.toLowerCase()))
          ) {
            e.preventDefault();
            insertSuggestion(suggestions[0]);
            return;
          }
        }
        // If no suggestions or not at end of word, allow normal space insertion
        return;
      }

      // Only handle navigation/selection if popover is visible
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedIndex,
      insertSuggestion,
      value,
      extractCurrentWord,
    ]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  return (
    <div className="relative">
      <Popover open={showSuggestions && suggestions.length > 0}>
        <PopoverAnchor asChild>
          <div>
            <SecretTextarea
              ref={textareaRef}
              id={id}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={className}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="w-64 p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => insertSuggestion(suggestion)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors
                ${
                  index === selectedIndex
                    ? 'bg-muted text-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
