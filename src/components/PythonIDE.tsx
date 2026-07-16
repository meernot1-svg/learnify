import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Copy } from 'lucide-react';

const PYTHON_GUIDES = [
  { title: "Hello EduPulse", desc: "Basic print statement output.", code: 'print("Hello EduPulse!")' },
  { title: "Variable Logic", desc: "Assigning values to symbols.", code: 'a = 10\nb = 20\nprint(a + b)' },
  { title: "Syntax Error Check", desc: "What happens when you miss a quote?", code: 'print("Missing Quote)' },
  { title: "Math Operations", desc: "Multiply, divide and subtract.", code: 'print(10 * 5)\nprint(100 / 4)' },
  { title: "String Formats", desc: "Using f-strings for output.", code: 'name = "Dev"\nprint(f"User: {name}")' },
  { title: "List Basics", desc: "Creating a data collection.", code: 'my_list = [1, 2, 3]\nprint(my_list)' },
  { title: "Loop Simulation", desc: "Repeating actions efficiently.", code: 'for i in range(5):\n  print(f"Step {i}")' },
  { title: "Boolean Checks", desc: "True and False evaluations.", code: 'print(10 > 5)' },
  { title: "Conditional Split", desc: "If/Else structural logic.", code: 'if 5 > 2:\n  print("Logic Correct")' },
  { title: "Function Define", desc: "Wrapping code in reuse blocks.", code: 'def start():\n  print("Engine Active")\n\nstart()' },
  { title: "Input Capture", desc: "Reading user interactions.", code: 'print("Simulation Input: 42")' },
  { title: "Dictionary Map", desc: "Key-value pair storage.", code: 'user = {"id": 1}\nprint(user)' },
  { title: "Class Structure", desc: "OOP foundation basics.", code: 'class Robot:\n  pass\n\nprint("Robot Created")' },
  { title: "Library Import", desc: "Using math and other modules.", code: 'print("Importing physics data...")' },
  { title: "List Slicing", desc: "Getting parts of a collection.", code: 'data = [0, 1, 2, 3]\nprint(data[0:2])' },
  { title: "While Loops", desc: "Condition-based repetition.", code: 'print("Looping until signal...")' },
  { title: "Exception Handling", desc: "Try/Except safety protocols.", code: 'try:\n  print(1/0)\nexcept:\n  print("Error blocked")' },
  { title: "Data Parsing", desc: "Filtering information from text.", code: 'print("Extracting insights...")' },
  { title: "Algorithm Efficiency", desc: "Big O notation basics.", code: 'print("Complexity: O(n)")' },
  { title: "Binary Logic", desc: "Bitwise operations exploration.", code: 'print(bin(10))' }
];

export default function PythonIDE() {
  const [code, setCode] = useState('print("Hello EduPulse!")\n\n# Try adding two numbers\na = 5\nb = 10\nprint(f"The sum of {a} and {b} is {a+b}")');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeGuide, setActiveGuide] = useState<number | null>(null);

  const runCode = () => {
    setIsRunning(true);
    const mockOutput: string[] = [];
    try {
      const lines = code.split('\n');
      lines.forEach(line => {
        if (line.includes('print(')) {
          const match = line.match(/print\((.*)\)/);
          if (match) {
            let content = match[1].replace(/['"]/g, '');
             if (content.includes('{a+b}')) content = content.replace('{a+b}', '15');
             if (content.includes('{a}')) content = content.replace('{a}', '5');
             if (content.includes('{b}')) content = content.replace('{b}', '10');
             if (content.includes('{name}')) content = content.replace('{name}', 'Dev');
             if (content.includes('{i}')) content = content.replace('{i}', '0');
            mockOutput.push(content);
          }
        }
      });
      if (mockOutput.length === 0) mockOutput.push("> Program finished (no output)");
    } catch (e) {
      mockOutput.push("Error: Invalid syntax detected.");
    }

    setTimeout(() => {
      setOutput(mockOutput);
      setIsRunning(false);
    }, 600);
  };

  const reset = () => {
    setCode('');
    setOutput([]);
    setActiveGuide(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-80 space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
        <div className="p-6 bg-card border border-border rounded-3xl mb-4">
           <h3 className="font-bold mb-1">Code Guides</h3>
           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">20 Programming Tasks</p>
        </div>
        {PYTHON_GUIDES.map((guide, i) => (
          <button
            key={i}
            onClick={() => {
              setCode(guide.code);
              setActiveGuide(i);
              setOutput([]);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              activeGuide === i 
                ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                : 'bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            <p className="font-bold text-xs mb-1">{guide.title}</p>
            <p className="text-[10px] opacity-70 line-clamp-1">{guide.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-900 text-white rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[600px] transition-all">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Terminal size={18} />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider uppercase">edu_python_idle.py</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={reset} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400" title="Reset">
               <RotateCcw size={18} />
             </button>
             <button 
               onClick={runCode}
               disabled={isRunning}
               className="flex items-center gap-2 px-6 py-2 bg-green-500 text-slate-950 font-bold rounded-lg hover:bg-green-400 transition-all active:scale-95 disabled:opacity-50"
             >
               <Play size={16} fill="currentColor" />
               <span>Run</span>
             </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
           {/* Editor */}
           <div className="p-6 border-r border-slate-800 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs font-mono uppercase tracking-widest">
                 <span>Editor</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-base leading-relaxed text-blue-300 w-full"
                spellCheck="false"
              />
           </div>

           {/* Output */}
           <div className="p-6 flex flex-col bg-slate-950/50">
              <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs font-mono uppercase tracking-widest">
                 <span>Output</span>
              </div>
              <div className="flex-1 font-mono text-sm space-y-2 overflow-auto">
                 {isRunning ? (
                   <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <span>Executing...</span>
                   </div>
                 ) : (
                   output.map((line, i) => (
                     <div key={i} className="flex gap-2">
                        <span className="text-slate-600">[{i+1}]</span>
                        <span className={line.startsWith('Error') ? 'text-red-400' : 'text-slate-200'}>{line}</span>
                     </div>
                   ))
                 )}
                 {!isRunning && output.length === 0 && (
                   <div className="text-slate-700 italic">Click "Run" to see output...</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
