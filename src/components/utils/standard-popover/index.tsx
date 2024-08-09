import { Popover } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";

type StandardPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  handlePopoverClose: () => void;
  content: string;
};

const StandardPopover = ({
  open,
  anchorEl,
  handlePopoverClose,
  content,
}: StandardPopoverProps) => {
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
      <div
        style={backgroundStyle}
        className="p-2 text-sm font-bold tracking-tight"
      >
        {content}
      </div>
    </Popover>
  );
};

export default StandardPopover;
