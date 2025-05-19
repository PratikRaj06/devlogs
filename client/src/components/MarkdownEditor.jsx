import { useEffect, useRef } from "react";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"; // One Light theme

const MarkdownEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const easyMDERef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      easyMDERef.current = new EasyMDE({
        element: editorRef.current,
        spellChecker: true,
        autosave: { enabled: false, uniqueId: "dev-journal", delay: 1000 },
        toolbar: [
          "bold", "italic", "heading", "|",
          "unordered-list", "ordered-list", "table", "|",
          "link", "image", "code", "quote", "|",
          "preview", "fullscreen", "|",
          "guide"
        ],
        initialValue: value, // Initial value
        renderingConfig: {
          codeSyntaxHighlighting: true,
        },
        previewRender: (plainText) => {
          return `<pre><code>${hljs.highlightAuto(plainText).value}</code></pre>`;
        },
      });

      easyMDERef.current.codemirror.on("change", () => {
        onChange(easyMDERef.current.value());
      });
    }

    return () => {
      if (easyMDERef.current) {
        easyMDERef.current.toTextArea();
        easyMDERef.current = null;
      }
    };
  }, []);

  // ✅ Update editor content when `value` changes
  useEffect(() => {
    if (easyMDERef.current && easyMDERef.current.value() !== value) {
      easyMDERef.current.value(value);
    }
  }, [value]);

  return <textarea ref={editorRef} />;
};

export default MarkdownEditor;
