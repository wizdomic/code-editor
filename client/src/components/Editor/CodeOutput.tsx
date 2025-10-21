import { Terminal } from 'lucide-react';

interface CodeOutputProps {
  output: string;
  isLoading: boolean;
  error: string | null;
}

export function CodeOutput({ output, isLoading, error }: CodeOutputProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <div className="flex items-center space-x-2 mb-2">
        <Terminal className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Output</h3>
      </div>
      <div className="font-mono text-sm overflow-auto max-h-[200px]">
        {isLoading ? (
          <div className="text-blue-400">Running code...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="text-green-400 whitespace-pre-wrap">{output}</div>
        )}
      </div>
    </div>
  );
}