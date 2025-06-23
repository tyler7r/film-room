import { Typography, useTheme } from "@mui/material"; // Import Typography and useTheme
import { useIsDarkContext } from "~/pages/_app";

type PageTitleProps = {
  title: string;
  size:
    | "xxx-small"
    | "xx-small"
    | "x-small"
    | "small"
    | "medium"
    | "large"
    | "x-large";
  purple?: boolean;
  fullWidth?: boolean;
  sx?: object; // Add sx prop for custom styling
};

const PageTitle = ({ title, size, purple, fullWidth, sx }: PageTitleProps) => {
  const { isDark } = useIsDarkContext();
  const theme = useTheme();

  // Define font sizes using Material UI's typography system for responsiveness
  // You can map your custom sizes to Material UI variants or specific font sizes
  const fontSizeMap = {
    "xxx-small": { xs: "0.875rem", md: "1rem" }, // text-sm md:text-base
    "xx-small": { xs: "1rem", md: "1.125rem" }, // text-base md:text-lg
    "x-small": { xs: "1.25rem", md: "1.5rem" }, // text-xl md:text-2xl
    small: { xs: "1.875rem", md: "2.25rem" }, // text-3xl md:text-4xl
    medium: { xs: "2.25rem", md: "3rem" }, // text-4xl md:text-5xl
    large: { xs: "3rem", md: "3.75rem" }, // text-5xl md:text-6xl
    "x-large": { xs: "3.75rem", md: "5rem" }, // text-6xl md:text-8xl
  };

  const selectedFontSize = fontSizeMap[size];

  // Determine color based on purple prop and theme
  const textColor = purple
    ? isDark
      ? theme.palette.secondary.light // Equivalent to purple-400
      : theme.palette.secondary.dark // Equivalent to purple-A400
    : theme.palette.text.primary; // Default text color

  return (
    <Typography
      variant="h4" // A default variant, actual size is controlled by fontSize
      sx={{
        textAlign: "center",
        fontWeight: "bold",
        letterSpacing: "-0.05em", // tracking-tighter
        fontSize: selectedFontSize,
        color: textColor,
        width: fullWidth ? "100%" : "auto",
        whiteSpace: "nowrap", // <--- ADD THIS LINE
        overflow: "hidden", // Hide overflowing text
        textOverflow: "ellipsis", // Show ellipsis for overflow
        minWidth: 0, // Allow flex item to shrink (crucial when in flex containers)
        maxWidth: "100%", // Ensure it respects the parent's width
        ...sx, // Apply any additional sx props passed from parent
      }}
    >
      {title}
    </Typography>
  );
};

export default PageTitle;
