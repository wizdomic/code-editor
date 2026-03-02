import { Terminal, Info } from 'lucide-react';

interface Props {
  output:        string;
  error:         string | null;
  isLoading:     boolean;
  stdin:         string;
  onStdinChange: (v: string) => void;
  runBy?:        string | null;
}

export function CodeOutput({ output, error, isLoading, stdin, onStdinChange, runBy }: Props) {
  return (
    <div className="flex h-full bg-gray-950 divide-x divide-gray-800/80">

      {/* output pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800 flex-shrink-0">
          <Terminal className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Output</span>
          {isLoading && (
            <span className="ml-auto text-xs text-blue-400 animate-pulse">Running…</span>
          )}
          {runBy && !isLoading && (
            <span className="ml-auto text-xs text-purple-400/80">run by {runBy}</span>
          )}
        </div>
        <div className="flex-1 overflow-auto p-3 font-mono text-sm">
          {error
            ? <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{error}</pre>
            : output
            ? <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">{output}</pre>
            : <span className="text-gray-700 italic text-xs">
                Run your code to see output here · Ctrl+Enter
              </span>
          }
        </div>
      </div>

      {/* stdin pane */}
      <div className="w-44 sm:w-52 flex flex-col flex-shrink-0">
        <div className="flex items-center px-3 py-1.5 border-b border-gray-800 flex-shrink-0">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Stdin</span>
        </div>
        <textarea value={stdin} onChange={e => onStdinChange(e.target.value)}
          placeholder={'One value per line:\n42\nhello\n...'}
          className="flex-1 w-full bg-transparent text-gray-300 font-mono text-sm
                     p-3 resize-none focus:outline-none placeholder-gray-700/60" />
        <div className="flex items-start gap-1.5 px-3 py-2 border-t border-gray-800 bg-gray-900/30">
          <Info className="w-3 h-3 text-gray-700 flex-shrink-0 mt-px" />
          <p className="text-[10px] text-gray-700 leading-tight">
            Input prompts appear in Output — normal JDoodle behaviour.
          </p>
        </div>
      </div>
    </div>
  );
}