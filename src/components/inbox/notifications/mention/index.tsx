import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PublicIcon from "@mui/icons-material/Public";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { getTimeSinceNotified } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MentionNotificationType } from "~/utils/types";

type InboxMentionProps = {
  mention: MentionNotificationType;
};

const InboxMention = ({ mention }: InboxMentionProps) => {
  const { hoverText, hoverBorder, backgroundStyle } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();

  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isUnread, setIsUnread] = useState<boolean>(false);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchIfUnread = async () => {
    const { data } = await supabase
      .from("play_mentions")
      .select("viewed")
      .eq("id", mention.mention.id)
      .single();
    if (data) {
      setIsUnread(data.viewed ? false : true);
    }
  };

  const updateMention = async () => {
    await supabase
      .from("play_mentions")
      .update({ viewed: true })
      .eq("id", mention.mention.id);
    void fetchIfUnread();
  };

  const markUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePopoverClose();
    await supabase
      .from("play_mentions")
      .update({ viewed: false })
      .eq("id", mention.mention.id);
    void fetchIfUnread();
  };

  const handleClick = async () => {
    const { mention: mntn, play } = mention;
    if (!mntn.viewed) void updateMention();
    void router.push(`/play/${play.id}`);
    setIsOpen(false);
  };

  useEffect(() => {
    void fetchIfUnread();
  }, []);

  return (
    <div key={mention.mention.id}>
      <div className="flex items-center justify-end gap-1 text-right text-xs font-light italic leading-4">
        {getTimeSinceNotified(mention.play.created_at)}
      </div>
      <div className="flex items-center justify-center gap-1">
        {isUnread && <FiberManualRecordIcon fontSize="small" color="primary" />}
        {!isUnread && (
          <div
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={(e) => markUnread(e)}
            className="cursor-pointer"
          >
            <FiberManualRecordIcon fontSize="small" color="action" />
            <StandardPopover
              content="Mark unread"
              open={open}
              anchorEl={anchorEl}
              handlePopoverClose={handlePopoverClose}
            />
          </div>
        )}
        <div
          onClick={handleClick}
          className={`flex w-full flex-col gap-1 ${hoverBorder}`}
          style={backgroundStyle}
        >
          <div className="flex w-full flex-col">
            <PageTitle size="xx-small" title={mention.video.title} />
          </div>
          <Divider flexItem variant="middle"></Divider>
          <div className="flex items-center gap-1 text-sm">
            {mention.team && (
              <IconButton size="small">
                <TeamLogo tm={mention.team} size={25} />
              </IconButton>
            )}
            {!mention.team && <PublicIcon fontSize="small" />}
            <div>
              <strong
                className={`${hoverText} text-sm tracking-tight`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  void router.push(`/profile/${mention.play.author_id}`);
                }}
              >
                {mention.author.name}
              </strong>{" "}
              mentioned you:{" "}
              {mention.play.title.length > 50
                ? `${mention.play.title.slice(0, 50)}...`
                : mention.play.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxMention;
