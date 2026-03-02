import { Play, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props { onClick: () => void; isLoading: boolean; }

export function ExecuteButton({ onClick, isLoading }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading) {
        e.preventDefault(); onClick();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClick, isLoading]);

  return (
    <button onClick={onClick} disabled={isLoading} title="Run (Ctrl+Enter)"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        isLoading
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-500 text-white'
      }`}>
      {isLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Play    className="w-3.5 h-3.5 fill-current" />}
      {isLoading ? 'Running…' : 'Run'}
    </button>
  );
}