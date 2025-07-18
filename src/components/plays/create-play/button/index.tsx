import BuildIcon from "@mui/icons-material/Build";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Box, Fab, Tooltip } from "@mui/material";

type PlayModalBtnProps = {
  isPlayStarted: boolean;
  startPlay: () => void;
  endPlay: () => void;
  scrollToPlayer: () => void;
  setIsOpen: (open: boolean) => void;
  draftedPlay: boolean;
};

const PlayModalBtn = ({
  isPlayStarted,
  startPlay,
  endPlay,
  draftedPlay,
  setIsOpen,
}: PlayModalBtnProps) => {
  const handleStart = () => {
    startPlay();
  };

  const handleEnd = () => {
    endPlay();
  };

  return draftedPlay ? (
    <Box sx={{ zIndex: 20 }}>
      <Tooltip
        title="Edit your current drafted play."
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <Fab
          color="primary"
          aria-label="scroll to top"
          onClick={() => setIsOpen(true)}
        >
          <BuildIcon fontSize="large" />
        </Fab>
      </Tooltip>
    </Box>
  ) : !isPlayStarted ? (
    <Box sx={{ zIndex: 20 }}>
      <Tooltip
        title="START RECORDING, once your play ends make sure to click END RECORDING to complete your note!"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <Fab color="primary" aria-label="scroll to top" onClick={handleStart}>
          <PlayArrowIcon sx={{ fontSize: "48px" }} />
        </Fab>
      </Tooltip>
    </Box>
  ) : (
    <Box className="z-20">
      <Tooltip
        title="END RECORDING, once clicked you will be prompted to fill out the details of your play!"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <Fab color="primary" aria-label="scroll to top" onClick={handleEnd}>
          <StopIcon sx={{ fontSize: "48px" }} />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default PlayModalBtn;
