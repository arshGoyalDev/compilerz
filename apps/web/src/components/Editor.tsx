import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { useCallback, useState } from "react";

import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

const darkTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#0a0a0a',           // neutral-950
    backgroundImage: '',
    foreground: '#d4d4d4',           // neutral-300
    caret: '#f5f5f5',                // neutral-100
    selection: '#52525226',          // neutral-600 with transparency
    selectionMatch: '#52525226',     // neutral-600 with transparency
    lineHighlight: '#1717171a',      // neutral-900 with transparency
    gutterBackground: '#0a0a0a',     // neutral-950
    gutterForeground: '#52525266',   // neutral-600 with transparency
  },
  styles: [
    { tag: t.comment, color: '#737373' },                    // neutral-500
    { tag: t.variableName, color: '#e5e5e5' },               // neutral-200
    { tag: [t.string, t.special(t.brace)], color: '#a3a3a3' }, // neutral-400
    { tag: t.number, color: '#d4d4d4' },                     // neutral-300
    { tag: t.bool, color: '#d4d4d4' },                       // neutral-300
    { tag: t.null, color: '#737373' },                       // neutral-500
    { tag: t.keyword, color: '#f5f5f5' },                    // neutral-100
    { tag: t.operator, color: '#a3a3a3' },                   // neutral-400
    { tag: t.className, color: '#e5e5e5' },                  // neutral-200
    { tag: t.definition(t.typeName), color: '#f5f5f5' },     // neutral-100
    { tag: t.typeName, color: '#d4d4d4' },                   // neutral-300
    { tag: t.angleBracket, color: '#a3a3a3' },               // neutral-400
    { tag: t.tagName, color: '#e5e5e5' },                    // neutral-200
    { tag: t.attributeName, color: '#a3a3a3' },              // neutral-400
  ],
});

const lightTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',           // neutral-50
    backgroundImage: '',
    foreground: '#404040',           // neutral-700
    caret: '#171717',                // neutral-900
    selection: '#a3a3a326',          // neutral-400 with transparency
    selectionMatch: '#a3a3a326',     // neutral-400 with transparency
    lineHighlight: '#f5f5f51a',      // neutral-100 with transparency
    gutterBackground: '#fafafa',     // neutral-50
    gutterForeground: '#a3a3a366',   // neutral-400 with transparency
  },
  styles: [
    { tag: t.comment, color: '#737373' },                    // neutral-500
    { tag: t.variableName, color: '#262626' },               // neutral-800
    { tag: [t.string, t.special(t.brace)], color: '#525252' }, // neutral-600
    { tag: t.number, color: '#404040' },                     // neutral-700
    { tag: t.bool, color: '#404040' },                       // neutral-700
    { tag: t.null, color: '#737373' },                       // neutral-500
    { tag: t.keyword, color: '#171717' },                    // neutral-900
    { tag: t.operator, color: '#525252' },                   // neutral-600
    { tag: t.className, color: '#262626' },                  // neutral-800
    { tag: t.definition(t.typeName), color: '#171717' },     // neutral-900
    { tag: t.typeName, color: '#404040' },                   // neutral-700
    { tag: t.angleBracket, color: '#525252' },               // neutral-600
    { tag: t.tagName, color: '#262626' },                    // neutral-800
    { tag: t.attributeName, color: '#525252' },              // neutral-600
  ],
});

const extensions = [cpp()];

const Editor = ({ filename, codeExample }: { filename: string; codeExample: string }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [value, setValue] = useState(codeExample);
  const onChange = useCallback((val: string) => {
    console.log("val:", val);
    setValue(val);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-neutral-900 border-r-2 border-t-2 border-neutral-800 overflow-auto">
      <div className="flex items-center">
        <div className="py-3 px-5 bg-neutral-950 border-r-2 border-neutral-800">
          {filename}
        </div>
        <div className="flex justify-end items-center w-full border-b-2 h-full border-neutral-800">
          <button className="cursor-pointer bg-white py-1 h-fit px-4 text-black mr-4">
            Run
          </button>
        </div>
      </div>
      <div className="bg-neutral-950 flex-1  overflow-y-auto">
        <CodeMirror
          value={value}
          theme={theme === 'dark' ? darkTheme : lightTheme}
          className="text-base"
          // extensions={extensions}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Editor;
