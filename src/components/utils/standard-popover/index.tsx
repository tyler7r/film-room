import { Tooltip } from "@mui/material";

const StandardPopover = ({
  content, // Renamed from 'content' to 'title' to align with Tooltip's prop
  children,
  ...props // Capture any additional TooltipProps
}: {
  content: string;
  children: React.ReactElement;
}) => {
  // const { backgroundStyle } = useIsDarkContext();

  return (
    <Tooltip
      title={content} // Tooltip uses 'title' prop for content
      arrow // Adds a small arrow pointing to the element
      placement="bottom" // Default placement, can be overridden by props
      slotProps={{
        tooltip: {
          sx: {
            // ...backgroundStyle, // Apply dark context background style to the tooltip content
            p: 1, // Adjusted padding for tooltip content
            fontSize: "0.75rem", // Smaller font for tooltips
            fontWeight: "bold",
            letterSpacing: "-0.01em", // A tight letter spacing
            borderRadius: "4px", // Standard tooltip border radius
            maxWidth: { xs: 200, sm: 250 }, // Constrain width on mobile for readability
            textAlign: "center", // Center text within the tooltip
            // Removed 'pointerEvents: "none"' as Tooltip is non-interactive by default
          },
        },
      }}
      {...props} // Spread any other props passed to StandardTooltip
    >
      {children}
    </Tooltip>
  );
};

export default StandardPopover;
