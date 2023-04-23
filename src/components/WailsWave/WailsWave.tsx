import { Box } from "@mui/material";
import React, { useMemo } from "react";
//@ts-ignore
import Waveform from "./Waveform.jsx";

export interface WailsWaveProps {
  audioFile: string;
  jsonContent?: string;
}

export default function WailsWave({ audioFile, jsonContent }: WailsWaveProps) {
  const regions = useMemo(() => {
    if (!jsonContent) {
      return [];
    }
    try {
      const json = JSON.parse(jsonContent);
      return [...json["regions"]];
    } catch (e) {
      return [];
    }
  }, [jsonContent]);

  return (
    <Box
      sx={{
        padding: "1rem",
        backgroundColor: "white",
      }}
    >
      <Waveform audio={audioFile} regions={regions} />
    </Box>
  );
}
