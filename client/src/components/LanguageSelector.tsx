import { useEditorStore }    from '../store/editorStore';
import { SUPPORTED_LANGUAGES } from '../types/editor';

interface Props { onChange?: (lang: string) => void; disabled?: boolean; }

export function LanguageSelector({ onChange, disabled }: Props) {
  const language = useEditorStore(s => s.language);
  return (
    <select value={language} onChange={e => onChange?.(e.target.value)} disabled={disabled}
      className="bg-gray-700 border border-gray-600 text-white text-sm px-2 py-1.5 rounded
                 focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-colors">
      {SUPPORTED_LANGUAGES.map(l => (
        <option key={l.id} value={l.id}>{l.name}</option>
      ))}
    </select>
  );
}