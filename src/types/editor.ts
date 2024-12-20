export interface ExecutionResult {
  output: string;
  error: string | null;
}

export interface LanguageConfig {
  execute: (code: string) => Promise<ExecutionResult>;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    defaultCode: 'console.log("Hello, World!");'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    defaultCode: 'console.log("Hello, World!");'
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    defaultCode: 'print("Hello, World!")'
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    defaultCode: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    defaultCode: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`
  },
  {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    defaultCode: '<?php\necho "Hello, World!";'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    defaultCode: 'puts "Hello, World!"'
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    defaultCode: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    defaultCode: `fn main() {
    println!("Hello, World!");
}`
  }
];