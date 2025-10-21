import { useEditorStore } from '../store/editorStore';
import { socket } from '../socket';
import { SUPPORTED_LANGUAGES } from '../types/editor';

export function LanguageSelector() {
  const { language, roomId, setLanguage } = useEditorStore();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage); // Updates code automatically
    if (roomId) {
      socket.emit('language-change', { roomId, language: newLanguage });
    }
  };

  return (
    <select
      value={language}
      onChange={(e) => handleLanguageChange(e.target.value)}
      className="bg-gray-900 text-white px-3 py-1 rounded-md"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
