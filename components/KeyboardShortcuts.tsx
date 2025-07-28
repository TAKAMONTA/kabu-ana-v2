import React, { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onAnalyze?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ 
  onAnalyze, 
  onCancel, 
  isLoading = false 
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            if (!isLoading && onAnalyze) {
              onAnalyze();
            }
            break;
          case 'Escape':
            event.preventDefault();
            if (isLoading && onCancel) {
              onCancel();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAnalyze, onCancel, isLoading]);

  return null;
};

export default KeyboardShortcuts;
