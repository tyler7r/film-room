import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";

type ModalSkeletonProps = {
  isOpen: boolean;
  setIsOpen: (status: boolean) => void;
  handleClose?: () => void; // Discard action (X button)
  handleMinimize?: () => void; // Save Draft action (Minimize button)
  title: string;
  children: React.ReactNode;
};

/**
 * A reusable modal component using Material UI Dialog.
 */
const OverlappingPlaysModal: React.FC<ModalSkeletonProps> = ({
  isOpen,
  handleClose, // Discard action (X button)
  handleMinimize, // Save Draft action (Minimize button)
  title,
  children,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose} // Default close action is Discard
      fullWidth
      aria-labelledby="modal-title"
      sx={{
        "& .MuiBackdrop-root": { backdropFilter: "blur(3px)" },
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          margin: { xs: "16px", sm: "32px" },
          width: { xs: "95%", sm: "100%" },
        },
      }}
    >
      <DialogTitle
        id="modal-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0eeef",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "600" }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
            // backgroundColor: `${isDark ? colors.grey[800] : colors.grey[100]}`,
          }}
        >
          {/* Minimize Button: Saves as Draft */}
          {handleMinimize && (
            <IconButton
              aria-label="minimize"
              onClick={handleMinimize}
              size="small"
              sx={{
                "&:hover": { color: "info.main" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseFullscreenIcon fontSize="small" />
            </IconButton>
          )}
          {/* Close Button: Discards Progress */}
          {handleClose && (
            <IconButton
              aria-label="close"
              onClick={handleClose} // Discards progress and closes
              size="small"
              sx={{ "&:hover": { color: "error.main" } }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default OverlappingPlaysModal;
