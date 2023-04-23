import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import WaveSurfer from "wavesurfer.js";
import AudioControllBar from "../AudioControllBar/AudioControllBar";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

const Waveform = ({ audio, regions }) => {
  const [waver, setWaver] = useState(null);
  const containerRef = useRef();

  const buildRegion = (start, end, isSpeech) => {
    return {
      start: start,
      end: end,
      loop: false,
      color: isSpeech ? "hsla(400, 50%, 70%, 0.4)" : "hsla(200, 50%, 70%, 0.4)",
      drag: false,
      resize: false,
    };
  };

  useEffect(() => {
    if (containerRef.current) {
      if (waver) {
        waver.destroy();
      }

      let wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        responsive: true,
        barWidth: 1,
        progressColor: "purple",
        waveColor: "violet",
        plugins: [
          RegionsPlugin.create({
            //disableDragSelection: true,
            dragSelection: false,
            regions: regions.map((region) =>
              buildRegion(region.start, region.end, region.speech)
            ),
          }),
          TimelinePlugin.create({
            container: "#wave-timeline",
          }),
        ],
      });
      wavesurfer.load(audio);

      setWaver(wavesurfer);
    }
  }, []);

  useEffect(() => {
    if (waver) {
      waver.clearRegions();
      regions.map(({ start, end, speech }) => {
        waver.addRegion(buildRegion(start, end, speech));
      });
    }
  }, [regions]);

  return (
    <>
      <div className="flex-1" ref={containerRef} />
      <div id="wave-timeline" />
      {waver && <AudioControllBar waver={waver} />}
    </>
  );
};

Waveform.propTypes = {
  audio: PropTypes.string.isRequired,
};

export default Waveform;
