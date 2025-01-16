import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

type PlayModalBtnProps = {
  isPlayStarted: boolean;
  startPlay: () => void;
  endPlay: () => void;
  scrollToPlayer: () => void;
};

const PlayModalBtn = ({
  isPlayStarted,
  startPlay,
  endPlay,
  scrollToPlayer,
}: PlayModalBtnProps) => {
  const [isValidBtn, setIsValidBtn] = useState<boolean>(false);

  const handleStart = () => {
    scrollToPlayer();
    startPlay();
    setTimeout(() => {
      setIsValidBtn(true);
    }, 2000);
  };

  const handleEnd = () => {
    endPlay();
    setIsValidBtn(false);
  };

  return !isPlayStarted ? (
    <div>
      <Tooltip
        title="START RECORDING, once your play ends make sure to click END RECORDING to complete your note! Plays must be at least 2 seconds long."
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
          <PlayCircleFilledIcon sx={{ fontSize: "72px" }} />
        </IconButton>
      </Tooltip>
    </div>
  ) : (
    <div>
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
          disabled={!isValidBtn}
          color="primary"
        >
          <StopCircleIcon sx={{ fontSize: "72px" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PlayModalBtn;
