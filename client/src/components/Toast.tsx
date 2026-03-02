import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const ICON = {
  success: <CheckCircle  className="w-4 h-4 text-green-400  flex-shrink-0" />,
  error:   <AlertCircle  className="w-4 h-4 text-red-400    flex-shrink-0" />,
  info:    <Info         className="w-4 h-4 text-blue-400   flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
};

const BAR = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  info:    'bg-blue-500',
  warning: 'bg-yellow-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-3 bg-gray-800 border border-gray-700/60
                     pl-0 pr-3 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-xs
                     pointer-events-auto overflow-hidden">
          {/* colour bar */}
          <div className={`w-1 self-stretch rounded-l-xl flex-shrink-0 ${BAR[t.type]}`} />
          {ICON[t.type]}
          <span className="flex-1 text-sm text-gray-100 leading-snug">{t.message}</span>
          <button onClick={() => removeToast(t.id)}
            className="text-gray-600 hover:text-gray-300 transition-colors ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}