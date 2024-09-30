import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Button, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import InboxComment from "./comment";
import InboxMention from "./mention";

const InboxNotification = () => {
  const { unreadOnly, setUnreadOnly, notifications } = useInboxContext();

  const topRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (notifications && notifications.length > 0) setLoading(false);
    else {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [notifications]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={topRef} className="flex items-center justify-center gap-4">
        <div>
          <PageTitle title="Notifications" size="small" />
        </div>
        <IconButton
          size="small"
          onClick={() => setUnreadOnly(!unreadOnly)}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          {unreadOnly ? (
            <MailIcon color="primary" />
          ) : (
            <MailOutlineIcon color="primary" />
          )}
          <StandardPopover
            content={`${
              unreadOnly ? "All Notifications" : "Unread Notifications"
            }`}
            open={open}
            anchorEl={anchorEl}
            handlePopoverClose={handlePopoverClose}
          />
        </IconButton>
      </div>
      <div className="flex flex-col gap-2 md:px-2 lg:px-4">
        {loading && <PageTitle size="small" title="Loading..." />}
        {notifications?.map((notification) => (
          <div
            key={
              notification.comment
                ? notification.comment.id
                : notification.mention
                  ? notification.mention.id
                  : notification.play.id
            }
          >
            {notification.mention && (
              <InboxMention
                mention={{
                  team: notification.team,
                  mention: notification.mention,
                  play: notification.play,
                  video: notification.video,
                  author: notification.author,
                }}
              />
            )}
            {notification.comment && (
              <InboxComment
                comment={{
                  comment: notification.comment,
                  play: notification.play,
                  video: notification.video,
                  author: notification.author,
                }}
              />
            )}
          </div>
        ))}
        {notifications && notifications.length > 0 && !loading && (
          <div className="mt-2 flex w-full items-center justify-center">
            <Button
              startIcon={<KeyboardDoubleArrowUpIcon />}
              endIcon={<KeyboardDoubleArrowUpIcon />}
              variant="outlined"
              size="small"
              onClick={scrollToTop}
            >
              Jump to Top
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        {(!notifications || notifications.length === 0) && !loading && (
          <EmptyMessage message="notifications" size="small" />
        )}
      </div>
    </div>
  );
};

export default InboxNotification;
