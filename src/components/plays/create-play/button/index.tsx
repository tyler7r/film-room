import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Button, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

type PlayModalBtnProps = {
  isPlayStarted: boolean;
  startPlay: () => void;
  endPlay: () => void;
};

const PlayModalBtn = ({
  isPlayStarted,
  startPlay,
  endPlay,
}: PlayModalBtnProps) => {
  const [isValidBtn, setIsValidBtn] = useState<boolean>(false);

  const handleStart = () => {
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
      <Button
        sx={{ marginRight: "-8px", fontWeight: "bold" }}
        onClick={handleStart}
        size="large"
      >
        Start Recording
      </Button>
      <Tooltip
        title="Start your play recording, once your play ends make sure to click END RECORDING to complete your note! Plays must be at least 2 seconds long."
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
        <IconButton size="small">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  ) : (
    <div>
      <Button
        disabled={!isValidBtn}
        sx={{ fontWeight: "bold" }}
        onClick={handleEnd}
        size="large"
      >
        End Recording
      </Button>
      <Tooltip
        title="End your play recording, once clicked you will be prompted to fill out the details of your play!"
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
        <IconButton size="small">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PlayModalBtn;
