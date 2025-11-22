// import { Divider, colors } from "@mui/material";
// import { useEffect, useState } from "react";
// import { useIsDarkContext } from "~/pages/_app";
// import { supabase } from "~/utils/supabase";
// import type { StatsType } from "~/utils/types";

// type ProfileStatsProps = {
//   profileId: string | undefined;
// };

// const ProfileStats = ({ profileId }: ProfileStatsProps) => {
//   const { isDark } = useIsDarkContext();

//   const [stats, setStats] = useState<StatsType>({
//     mentionCount: 0,
//     playCount: 0,
//     highlightCount: 0,
//   });

//   const fetchStats = async () => {
//     if (profileId) {
//       const getMentions = await supabase
//         .from("plays_via_user_mention")
//         .select("*", {
//           count: "exact",
//         })
//         .eq("mention->>receiver_id", profileId);
//       const getHighlights = await supabase
//         .from("plays_via_user_mention")
//         .select("*", {
//           count: "exact",
//         })
//         .match({
//           "play->>highlight": true,
//           "mention->>receiver_id": profileId,
//         });
//       const getPlays = await supabase
//         .from("play_preview")
//         .select("*", {
//           count: "exact",
//         })
//         .eq("play->>author_id", profileId);
//       setStats({
//         mentionCount: getMentions.count ? getMentions.count : 0,
//         highlightCount: getHighlights.count ? getHighlights.count : 0,
//         playCount: getPlays.count ? getPlays.count : 0,
//       });
//     }
//   };

//   useEffect(() => {
//     void fetchStats();
//   }, [profileId]);

//   return (
//     stats && (
//       <div
//         className="flex w-full cursor-default items-center justify-around gap-2 rounded-md border-solid p-2 md:w-4/5"
//         style={
//           isDark
//             ? { backgroundColor: `${colors.purple[400]}` }
//             : { backgroundColor: `${colors.purple.A200}` }
//         }
//       >
//         <div className="flex cursor-pointer flex-col items-center justify-center">
//           <div className="text-3xl font-bold tracking-tight">
//             {stats.playCount}
//           </div>
//           <div className="text-base font-bold leading-4 tracking-tighter">
//             created
//           </div>
//         </div>
//         <Divider flexItem orientation="vertical" />
//         <div className="flex cursor-pointer flex-col items-center justify-center">
//           <div className="text-3xl font-bold tracking-tight">
//             {stats.mentionCount}
//           </div>
//           <div className="font-bold leading-4 tracking-tighter">mentions</div>
//         </div>
//         <Divider flexItem orientation="vertical" />
//         <div className="flex cursor-pointer flex-col items-center justify-center">
//           <div className="text-3xl font-bold tracking-tight">
//             {stats.highlightCount}
//           </div>
//           <div className="font-bold leading-4 tracking-tighter">highlights</div>
//         </div>
//       </div>
//     )
//   );
// };

// export default ProfileStats;

import {
  Box,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";

type StatsType = {
  mentionCount: number;
  playCount: number;
  highlightCount: number;
};

type ProfileStatsProps = {
  profileId: string | undefined;
};

const ProfileStats = ({ profileId }: ProfileStatsProps) => {
  const theme = useTheme();

  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const fetchStats = async () => {
    if (!profileId) {
      setStats({ mentionCount: 0, playCount: 0, highlightCount: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetching is done in parallel for efficiency
      const [getMentions, getHighlights, getPlays] = await Promise.all([
        supabase
          .from("plays_via_user_mention")
          .select("*", { count: "exact" })
          .eq("mention->>receiver_id", profileId),
        supabase
          .from("plays_via_user_mention")
          .select("*", { count: "exact" })
          .match({
            "play->>highlight": true,
            "mention->>receiver_id": profileId,
          }),
        supabase
          .from("play_preview")
          .select("*", { count: "exact" })
          .eq("play->>author_id", profileId),
      ]);

      console.log(getHighlights.data);

      setStats({
        mentionCount: getMentions.count ?? 0,
        highlightCount: getHighlights.count ?? 0,
        playCount: getPlays.count ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch profile stats:", error);
      // Set to 0 on error
      setStats({ mentionCount: 0, playCount: 0, highlightCount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, [profileId]);

  // Utility component for a single stat item
  const StatItem = ({ count, label }: { count: number; label: string }) => (
    <Box
      className="flex flex-col items-center justify-center p-0.5 transition duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
      sx={{ cursor: "pointer", minWidth: { xs: "70px", sm: "100px" } }}
    >
      <Typography
        variant={"h4"}
        component="div"
        sx={{
          fontWeight: 900, // Extra bold for the number
          letterSpacing: -0.5,
          color: theme.palette.text.primary,
        }}
      >
        {count}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600, // Semi-bold for the label
          textTransform: "uppercase",
          color: theme.palette.text.secondary, // Muted color for the label
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box
      className="flex w-full cursor-default items-center justify-around gap-1 rounded-xl p-2 shadow-lg md:w-4/5"
      sx={{
        backgroundColor: theme.palette.background.default, // Use theme's paper color for background
        border: `1px solid ${theme.palette.divider}`, // Subtle border
      }}
    >
      {isLoading ? (
        <Box className="flex items-center justify-center p-4">
          <CircularProgress size={24} />
          <Typography
            variant="body2"
            sx={{ ml: 2, color: theme.palette.text.secondary }}
          >
            Loading stats...
          </Typography>
        </Box>
      ) : (
        <>
          <StatItem count={stats?.playCount ?? 0} label="Created" />
          <Divider orientation="vertical" variant="middle" flexItem />
          <StatItem count={stats?.mentionCount ?? 0} label="Mentions" />
          <Divider orientation="vertical" variant="middle" flexItem />
          <StatItem count={stats?.highlightCount ?? 0} label="Highlights" />
        </>
      )}
    </Box>
  );
};

export default ProfileStats;
