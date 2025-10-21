import { LanguageConfig, ExecutionResult } from '../types/editor';

const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    execute: async (code: string): Promise<ExecutionResult> => {
      try {
        const context = {
          console: {
            log: (...args: any[]) => output.push(args.join(' ')),
            error: (...args: any[]) => output.push(`Error: ${args.join(' ')}`),
          },
          setTimeout: () => {},
          setInterval: () => {},
        };
        
        const output: string[] = [];
        const fn = new Function('context', `with(context){${code}}`);
        await fn(context);
        
        return { output: output.join('\n'), error: null };
      } catch (err) {
        return { output: '', error: err.message };
      }
    }
  },
  typescript: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return languageConfigs.javascript.execute(code);
    }
  },
  python: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('python', '3.10', code);
    }
  },
  java: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('java', '15.0.2', code);
    }
  },
  cpp: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('cpp', '10.2.0', code);
    }
  },
  csharp: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('csharp', '6.12.0', code);
    }
  },
  php: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('php', '8.2.3', code);
    }
  },
  ruby: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('ruby', '3.2.1', code);
    }
  },
  go: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('go', '1.19.5', code);
    }
  },
  rust: {
    execute: async (code: string): Promise<ExecutionResult> => {
      return executePiston('rust', '1.68.2', code);
    }
  }
};

async function executePiston(language: string, version: string, code: string): Promise<ExecutionResult> {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: code }]
      })
    });
    
    const data = await response.json();
    return {
      output: data.run.output,
      error: data.run.stderr || null
    };
  } catch (err) {
    return { output: '', error: `Failed to execute ${language} code` };
  }
}

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const config = languageConfigs[language];
  if (!config) {
    return { output: '', error: `Language '${language}' is not supported yet` };
  }
  
  return await config.execute(code);
};