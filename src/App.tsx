import Update from "@/components/update";
import {
  AppBar,
  Box,
  CircularProgress,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WailsWave from "./components/WailsWave/WailsWave";
import JsonEditor from "./components/JsonEditor/JsonEditor";
import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { EVENT_GET_ARGUMENTS } from "./constants";
import fs from "fs";

function App() {
  const [audioFile, setAudioFile] = useState<string>();
  const [jsonContent, setJsonContent] = useState<string>();

  useEffect(() => {
    // Listen for the event
    ipcRenderer.on(EVENT_GET_ARGUMENTS, (event, arg) => {
      console.log("[App.tsx]", "EVENT_GET_ARGUMENTS", arg);
      setAudioFile(arg.audioFilePath);
      setJsonContent(fs.readFileSync(arg.vadFilePath, "utf-8"));
    });
    ipcRenderer.send(EVENT_GET_ARGUMENTS, "Hello from React");
    return () => {
      ipcRenderer.removeAllListeners(EVENT_GET_ARGUMENTS);
    };
  }, []);

  const theme = createTheme();
  if (!audioFile) {
    return <CircularProgress />;
  }

  const updateJsonContent = (newJsonContent: string | undefined) => {
    setJsonContent(newJsonContent);
    console.log("update");
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            color="inherit"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            VAD Ui
          </Typography>
          <Update />
        </Toolbar>
      </AppBar>
      <Box id="container">
        <WailsWave audioFile={audioFile} jsonContent={jsonContent} />
        <JsonEditor
          jsonContent={jsonContent}
          updateJsonContent={updateJsonContent}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
