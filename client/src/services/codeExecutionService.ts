import { LanguageConfig, ExecutionResult } from '../types/editor';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const JDOODLE_LANGUAGES: Record<string, { language: string; versionIndex: string }> = {
  python:  { language: 'python3', versionIndex: '4' },
  java:    { language: 'java',    versionIndex: '4' },
  cpp:     { language: 'cpp17',   versionIndex: '1' },
  csharp:  { language: 'csharp',  versionIndex: '3' },
  php:     { language: 'php',     versionIndex: '4' },
  ruby:    { language: 'ruby',    versionIndex: '4' },
  go:      { language: 'go',      versionIndex: '4' },
  rust:    { language: 'rust',    versionIndex: '4' },
};

async function executeViaProxy(
  language: string,
  versionIndex: string,
  code: string
): Promise<ExecutionResult> {
  try {
    const response = await fetch(`${SERVER_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: code, language, versionIndex }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { output: '', error: data.error || `Server error ${response.status}` };
    }

    if (data.statusCode === 429) {
      return { output: '', error: 'JDoodle daily limit exceeded (200 calls/day on free tier)' };
    }

    // JDoodle puts everything (stdout, stderr, compile errors) inside data.output
    return {
      output: data.output ?? '',
      error: null,
    };
  } catch (err: any) {
    return { output: '', error: `Could not reach execution server: ${err.message}` };
  }
}

const languageConfigs: Record<string, LanguageConfig> = {
  // JavaScript runs locally in the browser
  javascript: {
    execute: async (code: string): Promise<ExecutionResult> => {
      try {
        const output: string[] = [];
        const context = {
          console: {
            log: (...args: any[]) => output.push(args.map(String).join(' ')),
            error: (...args: any[]) => output.push(`Error: ${args.map(String).join(' ')}`),
            warn: (...args: any[]) => output.push(`Warn: ${args.map(String).join(' ')}`),
          },
          setTimeout: () => {},
          setInterval: () => {},
        };
        const fn = new Function('context', `with(context){${code}}`);
        await fn(context);
        return { output: output.join('\n'), error: null };
      } catch (err: any) {
        return { output: '', error: err.message };
      }
    },
  },

  // TypeScript: strip types then run as JS
  typescript: {
    execute: async (code: string): Promise<ExecutionResult> => {
      const stripped = code
        .replace(/:\s*\w+(\[\])?(\s*[,)=])/g, '$2')
        .replace(/<[^>]+>/g, '')
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
      return languageConfigs.javascript.execute(stripped);
    },
  },

  // All other languages → server proxy → JDoodle
  ...Object.fromEntries(
    Object.entries(JDOODLE_LANGUAGES).map(([key, { language, versionIndex }]) => [
      key,
      {
        execute: (code: string) => executeViaProxy(language, versionIndex, code),
      } as LanguageConfig,
    ])
  ),
};

export const executeCode = async (
  code: string,
  language: string
): Promise<ExecutionResult> => {
  const config = languageConfigs[language];
  if (!config) {
    return { output: '', error: `Language '${language}' is not supported yet` };
  }
  return await config.execute(code);
};