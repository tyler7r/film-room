import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { Backdrop, Box, Fade, IconButton, Modal } from "@mui/material";
import type { ReactNode } from "react";
import { useIsDarkContext } from "~/pages/_app";
import PageTitle from "../page-title";

type ModalSkeletonProps = {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleClose: () => void;
  title: string;
  minimize?: boolean;
};

const ModalSkeleton = ({
  children,
  isOpen,
  setIsOpen,
  title,
  handleClose,
  minimize,
}: ModalSkeletonProps) => {
  const { backgroundStyle } = useIsDarkContext();

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      onClick={(e) => e.stopPropagation()}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          className="relative inset-1/2 flex w-11/12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-md pt-2 md:w-4/5 lg:w-1/2"
          sx={backgroundStyle}
        >
          <div className="absolute left-1 top-1">
            {minimize && (
              <IconButton onClick={() => setIsOpen(false)} size="small">
                <CloseFullscreenIcon />
              </IconButton>
            )}
          </div>
          <div className="absolute right-1 top-1">
            <IconButton onClick={handleClose} size="small" color="error">
              <CloseIcon sx={{ fontSize: "28px" }} />
            </IconButton>
          </div>
          <div className="flex w-4/5 items-center justify-center">
            <PageTitle title={title} size="small" />
          </div>
          <Box sx={{ maxHeight: "500px", width: "100%", overflow: "scroll" }}>
            {children}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalSkeleton;
