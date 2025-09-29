import { Box, Button, colors } from "@mui/material";

type FormButtonsProps = {
  isValid: boolean;
  handleCancel: () => void;
  submitTitle: string;
};

/**
 * Renders a full-width container with two action buttons (Cancel and Submit).
 * This component uses Material UI components and is styled to match the original
 * Tailwind design (split layout, large bold text, specific color palette).
 */
const FormButtons = ({
  isValid,
  handleCancel,
  submitTitle,
}: FormButtonsProps) => {
  // Custom styles approximated from Tailwind classes to ensure visual consistency
  const submitStyles = {
    // Shared button sizing and text styles (w-full, p-2, text-xl md:text-2xl, font-bold)
    flex: 1,
    height: "auto",
    fontSize: { xs: "1.25rem", md: "1.5rem" },
    fontWeight: "bold",
    borderRadius: 0,

    // Conditional Styles for Submit button
    ...(isValid
      ? {
          // Enabled: bg-purple-400 hover:bg-purple-500 text-white,
          backgroundColor: colors.purple[400],
          color: "white",
          "&:hover": {
            backgroundColor: colors.purple[500], // Purple 500
          },
          borderBottomRightRadius: "0.375rem", // rounded-br-md
        }
      : {
          // Disabled: bg-grey-400 text-grey-700
          backgroundColor: colors.grey[400], // Grey 400
          color: colors.grey[700], // Grey 700
          cursor: "default",
          borderBottomRightRadius: "0.375rem", // rounded-br-md
        }),
  };

  const cancelStyles = {
    // Shared button sizing and text styles
    flex: 1,
    height: "auto",
    fontSize: { xs: "1.25rem", md: "1.5rem" },
    fontWeight: "bold",
    borderRadius: 0,

    // Specific styles for Cancel button: bg-grey-200 hover:bg-grey-300 text-grey-800
    backgroundColor: colors.grey[200], // Grey 200
    color: colors.grey[800], // Grey 800
    "&:hover": {
      backgroundColor: colors.grey[300], // Grey 300
    },
    borderBottomLeftRadius: "0.375rem", // rounded-bl-md
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        // Ensure buttons don't have default MUI shadows
        "& button": {
          boxShadow: "none",
        },
      }}
    >
      <Button
        onClick={handleCancel}
        type="button"
        variant="contained"
        disableElevation
        sx={cancelStyles}
      >
        CANCEL
      </Button>
      <Button
        type="submit"
        disabled={!isValid}
        variant="contained"
        disableElevation
        sx={submitStyles}
      >
        {submitTitle}
      </Button>
    </Box>
  );
};

export default FormButtons;
