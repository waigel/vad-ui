import * as monaco from "monaco-editor";
import path from "path";
import { Alert, Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export interface JsonEditorProps {
  jsonContent?: string;
  updateJsonContent: (value: string | undefined) => void;
}
export default function JsonEditor({
  jsonContent,
  updateJsonContent,
}: JsonEditorProps) {
  const [jsonValidationError, setJsonValidationError] = useState<Error>();
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();

  //Bug if resize the winbdow, the editor is not resized
  //dirty fix if window size changes, trigger ref resize
  useEffect(() => {
    window.addEventListener("resize", () => {
      editor?.layout();
    });
  }, [editor]);

  useEffect(() => {
    const editor = monaco.editor.create(
      document.getElementById("editor") as HTMLDivElement,
      {
        value: jsonContent,
        language: "json",
      }
    );
    editor.onDidChangeModelContent((e) => {
      updateJsonContent(editor.getValue());
    });

    setEditor(editor);
    return () => {
      editor.dispose();
    };
  }, []);

  const _updateJsonContent = (value: string | undefined) => {
    updateJsonContent(value);
    try {
      JSON.parse(value || "");
      setJsonValidationError(undefined);
    } catch (e: any) {
      setJsonValidationError(e);
    }
  };

  useEffect(() => {
    _updateJsonContent(jsonContent);
  }, [jsonContent]);

  return (
    <>
      {jsonValidationError ? (
        <Alert severity="error">
          <strong>Warning!</strong> Inavlid JSON: {jsonValidationError.message}
        </Alert>
      ) : (
        <Alert severity="success">
          <strong>Valid JSON</strong>
        </Alert>
      )}

      <Box height={"calc(100vh - 340px)"} width={"100vw"} id="editor" />
      {/* <Editor
        height={"calc(100vh - 340px)"}
        defaultLanguage="json"
        defaultValue={jsonContent}
        onChange={_updateJsonContent}
      /> */}
    </>
  );
}
