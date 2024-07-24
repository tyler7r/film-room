import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { IconButton, Pagination } from "@mui/material";
import { useRef, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import StandardPopover from "~/components/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import InboxComment from "../comment";
import InboxMention from "../mention";

const InboxNotification = () => {
  const {
    unreadOnly,
    setUnreadOnly,
    notifications,
    notificationCount,
    page,
    setPage,
  } = useInboxContext();
  const { isMobile } = useMobileContext();

  const itemsPerPage = isMobile ? 5 : 10;
  const topRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={topRef}
        className="flex items-center justify-between text-2xl font-bold lg:mb-2 lg:text-3xl"
      >
        <div>Notifications</div>
        <div className="flex gap-2">
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
      </div>
      <div className="flex flex-col gap-5 md:px-2 lg:px-4">
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
                }}
              />
            )}
            {notification.comment && (
              <InboxComment
                comment={{
                  comment: notification.comment,
                  play: notification.play,
                  video: notification.video,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center">
        {notifications && notifications.length > 0 ? (
          <Pagination
            showFirstButton
            showLastButton
            sx={{ marginTop: "16px", marginBottom: "8px" }}
            size="medium"
            variant="text"
            shape="rounded"
            count={getNumberOfPages(itemsPerPage, notificationCount)}
            page={page}
            onChange={handlePageChange}
          />
        ) : (
          <EmptyMessage message="notifications" size="small" />
        )}
      </div>
    </div>
  );
};

export default InboxNotification;
