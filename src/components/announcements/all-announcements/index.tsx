import CreateIcon from "@mui/icons-material/Create";
import { IconButton, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { AnnouncementType } from "~/utils/types";
import EmptyMessage from "../../utils/empty-msg";
import PageTitle from "../../utils/page-title";
import StandardPopover from "../../utils/standard-popover";
import Announcement from "../announcement";
import CreateAnnouncement from "../create-announcement";

type AnnouncementsProps = {
  teamId: string;
  role: string;
};

const Announcements = ({ teamId, role }: AnnouncementsProps) => {
  const { isMobile } = useMobileContext();
  const [anncs, setAnncs] = useState<AnnouncementType[] | null>(null);
  const [announcementCount, setAnnouncementCount] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const itemsPerPage = isMobile ? 3 : 5;

  const fetchAnnouncements = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("announcements")
      .select("*", { count: "exact" })
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data && data.length > 0) setAnncs(data);
    else setAnncs(null);
    if (count) setAnnouncementCount(count);
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          void fetchAnnouncements();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchAnnouncements();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchAnnouncements();
  }, [page]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
      {isOpen && <CreateAnnouncement setIsOpen={setIsOpen} teamId={teamId} />}
      <div className="flex items-center justify-center gap-2">
        <PageTitle size="medium" title="Announcements" />
        {(role === "coach" || role === "owner") && (
          <IconButton
            onClick={() => setIsOpen(!isOpen)}
            size="small"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <CreateIcon fontSize="large" color="primary" />
            <StandardPopover
              content="Write an announcement"
              open={open}
              anchorEl={anchorEl}
              handlePopoverClose={handlePopoverClose}
            />
          </IconButton>
        )}
      </div>
      {!anncs && <EmptyMessage message="team announcements" size="small" />}
      {anncs?.map((annc) => <Announcement annc={annc} key={annc.id} />)}
      {anncs && announcementCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="small"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, announcementCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Announcements;
