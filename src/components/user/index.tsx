import {
  Box,
  Typography, // Import Typography
} from "@mui/material";
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import type { UserType } from "~/utils/types";
import PageTitle from "../utils/page-title"; // Import the updated PageTitle
import UserAffiliationsChip from "./user-teams";

type UserProps = {
  user: UserType;
  goToProfile: boolean;
  number?: number | null;
  small?: boolean;
  listItem?: boolean;
  coach?: boolean;
};

const User = ({
  user,
  goToProfile,
  small,
  number,
  coach,
  listItem,
}: UserProps) => {
  const { backgroundStyle, hoverBorder, isDark } = useIsDarkContext();
  const router = useRouter();

  const handleClick = () => {
    if (goToProfile) {
      void router.push(`/profile/${user.id}`);
    }
  };

  return (
    (user.name !== "" || user.email) && (
      <Box
        sx={{
          ...backgroundStyle,
          display: "flex",
          flexDirection: "row", // Stack vertically on xs, row on sm+
          alignItems: "center",
          justifyContent: "space-between", // Space out content and teams chip
          gap: { xs: 1, sm: 2 }, // Responsive gap
          width: small ? "100%" : "auto", // Small users take full width
          borderRadius: "4px", // rounded-sm
          p: { xs: 1, sm: 1.5 }, // Responsive padding
          cursor: goToProfile ? "pointer" : "default", // Only cursor pointer if clickable
          transition:
            "border-color 0.3s ease-in-out, background-color 0.3s ease-in-out",
          "&:hover": goToProfile
            ? // Hover styles for non-list items
              {
                borderColor: hoverBorder,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }
            : {},
        }}
        onClick={handleClick}
      >
        {/* User Name/Email, Number, Coach Indicator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start", // Align to start (left)
            gap: { xs: 1, sm: 2 }, // Responsive gap
            flexGrow: 1, // Allow this section to grow and take available space
            minWidth: 0, // Crucial: allows content within to shrink below its intrinsic width
          }}
        >
          {number && (
            <Typography
              variant="body2"
              sx={{ fontWeight: "light", flexShrink: 0 }}
            >
              #{number}
            </Typography>
          )}
          {coach && (
            <Typography
              variant="body2"
              sx={{ fontWeight: "light", flexShrink: 0 }}
            >
              coach
            </Typography>
          )}
          <PageTitle
            title={getDisplayName(user)} // Use the helper function here
            size={small ? "xx-small" : "x-small"} // Adjusted PageTitle size prop
            sx={{
              flexShrink: 1, // Allow text to shrink
              minWidth: 0, // Ensure it can shrink to 0 if needed (important for ellipsis)
              // The PageTitle component now handles whiteSpace, overflow, textOverflow
            }}
          />
        </Box>

        {/* User Affiliations Chip */}
        {!listItem && <UserAffiliationsChip user={user} />}
      </Box>
    )
  );
};

export default User;
