import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Button, IconButton, Tooltip } from "@mui/material";

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
  return !isPlayStarted ? (
    <div>
      <Button
        sx={{ marginRight: "-8px" }}
        onClick={() => startPlay()}
        size="large"
      >
        Start Recording
      </Button>
      <Tooltip
        title="Start your play recording, once your play ends make sure to click END RECORDING to complete your note!"
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
      <Button onClick={() => endPlay()} size="large">
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
