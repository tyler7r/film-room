import { Backdrop, Box, Button, Fade, Modal } from "@mui/material";
import type { ReactNode } from "react";
import { Logo } from "~/components/navbar/logo/logo";
import { useIsDarkContext } from "~/pages/_app";
import PageTitle from "../page-title";

type ModalSkeletonProps = {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
};

const ModalSkeleton = ({
  children,
  isOpen,
  setIsOpen,
  title,
}: ModalSkeletonProps) => {
  const { backgroundStyle } = useIsDarkContext();

  const handleClose = () => {
    setIsOpen(false);
  };

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
          <Button
            variant="text"
            sx={{
              position: "absolute",
              right: "0",
              top: "0",
              fontWeight: "bold",
              fontSize: "24px",
              lineHeight: "32px",
            }}
            onClick={() => handleClose()}
          >
            X
          </Button>
          <div className="absolute left-0 top-0">
            <Logo size="small" />
          </div>
          <div className="flex w-4/5 items-center justify-center">
            <PageTitle title={title} size="small" />
          </div>
          <div className="max-h-96 w-full overflow-scroll">{children}</div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalSkeleton;
