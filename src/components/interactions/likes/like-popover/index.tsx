import { Popover } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import type { LikeListType } from "~/utils/types";

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
      <div style={backgroundStyle} className="flex gap-1 p-2 text-xs font-bold">
        {likeList?.map((like) => (
          <div key={like.user_name}>{like.user_name}</div>
        ))}
      </div>
    </Popover>
  );
};

export default LikePopover;
