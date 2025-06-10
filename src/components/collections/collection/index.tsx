import PublicIcon from "@mui/icons-material/Public";
import { Box, colors, Divider, Typography, useTheme } from "@mui/material"; // Import Box, Typography, useTheme, colors
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
import TeamLogo from "~/components/teams/team-logo";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type CollectionProps = {
  small?: boolean;
  collection: CollectionViewType;
  listItem?: boolean; // Prop to indicate if it's used in a list/menu item
};

const Collection = ({ collection, small, listItem }: CollectionProps) => {
  const { backgroundStyle, hoverText, hoverBorder, isDark } =
    useIsDarkContext();
  const router = useRouter();
  const theme = useTheme(); // Access the MUI theme

  const [playCount, setPlayCount] = useState<number>(0);

  const fetchPlayCount = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client is not initialized.");
      setPlayCount(0);
      return;
    }
    const { count, error } = await supabase
      .from("collection_plays_view")
      .select("*", { count: "exact" })
      .eq("collection->>id", collection.collection.id);

    if (error) {
      console.error("Error fetching play count:", error);
      setPlayCount(0);
      return;
    }
    if (count) setPlayCount(count);
    else setPlayCount(0);
  }, [collection.collection.id]); // Dependency on collection.collection.id

  const handleClick = () => {
    if (listItem) return; // Prevent navigation if used as a list item in a menu
    else void router.push(`/collections/${collection.collection.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (listItem) return; // Prevent navigation if used as a list item in a menu
    else {
      e.stopPropagation(); // Prevent parent handleClick
      void router.push(`/profile/${collection.collection.author_id}`);
    }
  };

  useEffect(() => {
    void fetchPlayCount();
  }, [fetchPlayCount]); // Dependency on memoized fetchPlayCount

  // Determine font sizes more dynamically based on `listItem`
  const titleFontSize = listItem ? "0.9rem" : small ? "1rem" : "1.125rem";
  const authorFontSize = listItem ? "0.7rem" : small ? "0.8rem" : "0.9rem";

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center", // Align items vertically in the center
        justifyContent: "space-between", // Distribute space between sections
        gap: 1, // General gap between the three main sections
        p: listItem ? 0.75 : 1, // Adjusted padding: less for listItem, more for standard
        ...backgroundStyle,
        borderRadius: "8px",
        width: "100%", // Take full width
        cursor: !listItem ? "pointer" : "default",
        transition:
          "border-color 0.3s ease-in-out, background-color 0.3s ease-in-out",
        // Hover styles for non-list items
        ...(!listItem && {
          border: `1px solid transparent`,
          "&:hover": {
            borderColor: hoverBorder,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
          },
        }),
        // Specific styles for listItem (e.g., subtle hover background without border)
        ...(listItem && {
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      }}
    >
      {/* Left Part: Team Logo / Public Icon + optional vertical divider */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
      >
        {collection.team ? (
          <TeamLogo
            tm={collection.team}
            size={listItem ? 20 : small ? 25 : 35} // Smaller logo for list item/small
            inactive={true}
            popover={!listItem} // Popover only if not a listItem
          />
        ) : (
          <PublicIcon
            fontSize={listItem ? "small" : small ? "medium" : "large"}
            color="action"
          />
        )}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ height: listItem ? "1.5em" : "2em", mx: 0.5 }}
        />
      </Box>

      {/* Middle Part: Collection Info (Title, Author) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Always align text to start
          justifyContent: "center",
          flexGrow: 1, // Allows this section to take most space
          minWidth: 0, // Allow content to shrink if needed
          gap: listItem ? 0.1 : 0.25, // Very small gap for compactness
        }}
      >
        <Typography
          variant="body1" // Using body1 for titles, can adjust as needed
          sx={{
            textAlign: "left", // Always left-align
            fontWeight: "bold",
            fontSize: titleFontSize, // Apply calculated title font size
            lineHeight: 1.2, // Tighter line height
            whiteSpace: "nowrap", // Prevent wrapping
            overflow: "hidden", // Hide overflow
            textOverflow: "ellipsis", // Show ellipsis for overflow
            width: "100%", // Take full width
          }}
        >
          {collection.collection.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            textAlign: "left", // Always left-align
            fontWeight: "bold",
            letterSpacing: "-0.025em",
            cursor: !listItem ? "pointer" : "default",
            fontSize: authorFontSize, // Apply calculated author font size
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            ...(!listItem && { "&:hover": { color: hoverText } }),
          }}
          color="text.disabled"
          onClick={handleProfileClick}
        >
          {collection.profile.name !== ""
            ? collection.profile.name
            : collection.profile.email!}
        </Typography>
      </Box>

      {/* Right Part: Play Count Box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          p: 0.5, // Reduced padding for compactness
          flexDirection: "column", // Always column for play count box
          gap: 0.1, // Very small gap for compactness
          flexShrink: 0, // Prevent shrinking
          minWidth: listItem ? "40px" : "50px", // Ensure minimum width for count
          // Conditional background color based on theme mode
          backgroundColor: isDark ? colors.purple[700] : colors.purple[100],
        }}
      >
        <Typography
          variant={listItem ? "body1" : "body1"} // Smaller for listItem, body1 for standard
          sx={{ fontWeight: "bold", lineHeight: 1 }}
        >
          {playCount}
        </Typography>
        <Typography
          variant={listItem ? "caption" : "caption"} // Caption for listItem, body2 for standard
          sx={{ fontWeight: "bold", lineHeight: 1 }}
        >
          plays
        </Typography>
      </Box>
    </Box>
  );
};

export default Collection;
