import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { IconButton, Tooltip } from "@mui/material";

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
    <div className="z-20">
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
        <IconButton
          sx={{ fontWeight: "bold" }}
          onClick={() => setIsOpen(true)}
          size="small"
          color="primary"
        >
          <BuildCircleIcon sx={{ fontSize: "64px" }} />
        </IconButton>
      </Tooltip>
    </div>
  ) : !isPlayStarted ? (
    <div className="z-20">
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
        <IconButton
          sx={{ fontWeight: "bold" }}
          onClick={handleStart}
          size="small"
          color="primary"
        >
          <PlayCircleFilledIcon sx={{ fontSize: "64px" }} />
        </IconButton>
      </Tooltip>
    </div>
  ) : (
    <div className="z-20">
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
        <IconButton
          sx={{ fontWeight: "bold" }}
          onClick={handleEnd}
          size="small"
          color="primary"
        >
          <StopCircleIcon sx={{ fontSize: "64px" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PlayModalBtn;
