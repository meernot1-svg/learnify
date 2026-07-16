import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Console Sanitizer to prevent "Converting circular structure to JSON" in the sandboxed iframe console logger
const sanitizeArgs = (args: any[]) => {
  const seen = new WeakSet();
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      if (arg instanceof Error) {
        return `${arg.name || 'Error'}: ${arg.message || String(arg)}${arg.stack ? '\n' + arg.stack : ''}`;
      }
      try {
        return JSON.parse(
          JSON.stringify(arg, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular]';
              }
              seen.add(value);
            }
            return value;
          })
        );
      } catch (err) {
        return `[Unserializable ${arg.constructor?.name || 'Object'}]`;
      }
    }
    return arg;
  });
};

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function (...args) {
  originalLog.apply(console, sanitizeArgs(args));
};
console.warn = function (...args) {
  originalWarn.apply(console, sanitizeArgs(args));
};
console.error = function (...args) {
  originalError.apply(console, sanitizeArgs(args));
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

