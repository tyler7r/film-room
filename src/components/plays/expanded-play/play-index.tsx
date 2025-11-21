import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React from "react"; // Removed useCallback for fetchCollections
import CommentIndex from "~/components/interactions/comments/comment-index/play-index";
import { useIsDarkContext } from "~/pages/_app";
import { convertFullTimestamp } from "~/utils/helpers";
import type { UnifiedPlayIndexType } from "~/utils/types"; // Removed CollectionType import

type ExpandedPlayProps = {
  play: UnifiedPlayIndexType;
  activePlay?: UnifiedPlayIndexType;
  setCommentCount: (count: number) => void;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
  activeComment?: string | undefined;
};

const PlayIndexExpanded = ({
  play,
  setCommentCount,
  activeComment,
}: ExpandedPlayProps) => {
  const { hoverText } = useIsDarkContext();

  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        px: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          fontSize: "0.75rem", // Tailwind text-xs
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {convertFullTimestamp(play.play_created_at)}
        </Typography>
      </Box>
      {play.play_note && (
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="body2" // Adjusted for smaller text
            sx={{
              display: "inline",
              fontWeight: "bold",
              cursor: "pointer",
              "&:hover": {
                color: hoverText, // Applies hoverText dynamically
              },
              // Converted from Tailwind tracking-tight
              letterSpacing: "-0.025em",
            }}
            onClick={() => void router.push(`/profile/${play.author_id}`)}
          >
            Note:{" "}
          </Typography>
          <Typography variant="body2" sx={{ display: "inline", lineHeight: 1 }}>
            {play.play_note}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CommentIndex
          play={play}
          setCommentCount={setCommentCount}
          activeComment={activeComment}
        />
      </Box>
    </Box>
  );
};

export default PlayIndexExpanded;
