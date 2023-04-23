import Editor, { loader } from "@monaco-editor/react";
import path from "path";
import { Alert, Box } from "@mui/material";
import { useEffect, useState } from "react";

export interface JsonEditorProps {
  jsonContent?: string;
  updateJsonContent: (value: string | undefined) => void;
}
export default function JsonEditor({
  jsonContent,
  updateJsonContent,
}: JsonEditorProps) {
  const [jsonValidationError, setJsonValidationError] = useState<Error>();

  function ensureFirstBackSlash(str: string) {
    return str.length > 0 && str.charAt(0) !== "/" ? "/" + str : str;
  }

  function uriFromPath(_path: string) {
    const pathName = path.resolve(_path).replace(/\\/g, "/");
    return encodeURI("file://" + ensureFirstBackSlash(pathName));
  }

  loader.config({
    paths: {
      vs: uriFromPath(path.join("node_modules/monaco-editor/min/vs")),
    },
  });

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

      <Editor
        height={"calc(100vh - 340px)"}
        defaultLanguage="json"
        defaultValue={jsonContent}
        onChange={_updateJsonContent}
      />
    </>
  );
}
