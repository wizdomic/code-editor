import { useEditorStore } from '../store/editorStore';

const THEMES = [
  { id: 'vs-dark',  label: 'Dark'  },
  { id: 'vs',       label: 'Light' },
  { id: 'hc-black', label: 'HC'    },
];

export function ThemeSelector() {
  const { theme, setTheme } = useEditorStore();
  return (
    <select value={theme} onChange={e => setTheme(e.target.value)} title="Editor theme"
      className="bg-gray-700 border border-gray-600 text-white text-sm px-2 py-1.5 rounded
                 focus:outline-none focus:border-blue-500 transition-colors">
      {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
    </select>
  );
}