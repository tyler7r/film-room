import PersonIcon from "@mui/icons-material/Person";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import StandardPopover from "~/components/utils/standard-popover";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MentionType, PlayPreviewType } from "~/utils/types";

type PlayMentionsProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
};

const PlayMentions = ({
  play,
  handleMentionAndTagClick,
  activePlay,
}: PlayMentionsProps) => {
  const { hoverText } = useIsDarkContext();
  const router = useRouter();
  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("play->>id", play.play.id);
    if (data && data.length > 0) {
      const mentions: MentionType[] = data.map((mention) => mention.mention);
      setMentions(mentions);
    } else setMentions(null);
  };

  const handleClick = (e: React.MouseEvent, name: string, id: string) => {
    if (handleMentionAndTagClick) handleMentionAndTagClick(e, name);
    else void router.push(`/profile/${id}`);
  };

  useEffect(() => {
    void fetchMentions();
  }, [activePlay]);

  return (
    mentions && (
      <div className={`flex items-center`}>
        <IconButton
          size="small"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          <PersonIcon fontSize="small" />
        </IconButton>
        <StandardPopover
          content="Player Mentions"
          open={open}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
        />
        <div className="flex items-center">
          {mentions?.map((mention) => (
            <Button
              onClick={(e) =>
                handleClick(e, mention.receiver_name, mention.receiver_id)
              }
              key={mention.id}
              variant="text"
              style={{ fontSize: "12px", padding: "2px", fontWeight: "bold" }}
            >
              @{mention.receiver_name}
            </Button>
          ))}
        </div>
      </div>
    )
  );
};

export default PlayMentions;
