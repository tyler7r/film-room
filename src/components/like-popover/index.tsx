import { Popover } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { LikeListType } from "../comment";

type LikePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  handlePopoverClose: () => void;
  likeList: LikeListType | null;
};

const LikePopover = ({
  open,
  anchorEl,
  handlePopoverClose,
  likeList,
}: LikePopoverProps) => {
  const { backgroundStyle } = useIsDarkContext();

  return (
    <Popover
      id="mouse-over-popover"
      sx={{
        pointerEvents: "none",
      }}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      onClose={handlePopoverClose}
      disableRestoreFocus
      className="max-h-40"
    >
      <div style={backgroundStyle} className="p-2">
        {likeList?.map((like) => (
          <div key={like.user_name}>{like.user_name}</div>
        ))}
      </div>
    </Popover>
  );
};

export default LikePopover;
