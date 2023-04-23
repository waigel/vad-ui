import { PauseCircle, PlayCircle, ZoomIn, ZoomOut } from "@mui/icons-material";
import { Box, Button, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
export interface AudioControllBarProps {
  waver: WaveSurfer;
}

export default function AudioControllBar({ waver }: AudioControllBarProps) {
  const [isPlaying, toggleIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(200);

  //loop to update isPlaying
  useEffect(() => {
    const interval = setInterval(() => {
      toggleIsPlaying(waver?.isPlaying());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="center"
      sx={{
        backgroundColor: "lightgrey",
        borderRadius: "0.5rem",
      }}
    >
      <IconButton
        onClick={() => {
          waver.playPause();
          toggleIsPlaying(waver?.isPlaying());
        }}
      >
        {!isPlaying ? <PlayCircle /> : <PauseCircle />}
      </IconButton>
      <IconButton
        onClick={() => {
          waver.zoom(zoom * 2);
          setZoom(zoom * 2);
        }}
      >
        <ZoomIn />
      </IconButton>

      <IconButton
        onClick={() => {
          waver.zoom(zoom / 2);
          setZoom(zoom / 2);
        }}
      >
        <ZoomOut />
      </IconButton>
    </Box>
  );
}
