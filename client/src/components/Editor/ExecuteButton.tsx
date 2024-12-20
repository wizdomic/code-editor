import { Play } from 'lucide-react';

interface ExecuteButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function ExecuteButton({ onClick, isLoading }: ExecuteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
        isLoading
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      <Play className="w-4 h-4" />
      <span>{isLoading ? 'Running...' : 'Run Code'}</span>
    </button>
  );
}