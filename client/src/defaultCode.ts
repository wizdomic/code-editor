/**
 * Single source of truth for default starter code per language.
 * Referenced by editorStore (local language switch) and SUPPORTED_LANGUAGES (type definitions).
 */
const defaultCode: Record<string, string> = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,

  typescript: `// TypeScript\nconst greet = (name: string): string => {\n  return \`Hello, \${name}!\`;\n};\nconsole.log(greet("World"));`,

  python: `# Python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("World"))`,

  java: `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,

  cpp: `// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,

  csharp: `// C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,

  php: `<?php\necho "Hello, World!";`,

  ruby: `# Ruby\ndef greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")`,

  go: `// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,

  rust: `// Rust\nfn main() {\n    println!("Hello, World!");\n}`,
};

export default defaultCode;