import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { AnnouncementType } from "~/utils/types";
import Announcement from "../announcement";

type AnnouncementsProps = {
  teamId: string;
};

const Announcements = ({ teamId }: AnnouncementsProps) => {
  const { isMobile } = useMobileContext();
  const [anncs, setAnncs] = useState<AnnouncementType[] | null>(null);
  const [announcementCount, setAnnouncementCount] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState<number>(1);
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
      <div className="font-serif text-4xl font-bold italic tracking-tighter">
        Team Announcements
      </div>
      {!anncs && (
        <div className="text-2xl font-bold tracking-tight">
          No team announcements!
        </div>
      )}
      {anncs?.map((annc) => <Announcement annc={annc} key={annc.id} />)}
      {anncs && announcementCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="small"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(isMobile ? 3 : 5, announcementCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Announcements;
