import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import Team from "~/components/teams/team";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamType } from "~/utils/types";

type SearchTeamsProps = {
  topic: string;
};

const SearchTeams = ({ topic }: SearchTeamsProps) => {
  const { isMobile } = useMobileContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 50;

  const fetchTeams = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("teams")
      .select("*", { count: "exact" })
      .ilike("full_name", `%${topic}%`)
      .order("full_name")
      .range(from, to);
    if (data && data.length > 0) setTeams(data);
    else setTeams(null);
    if (count) setTeamCount(count);
    else setTeamCount(null);
    setLoading(false);
  });

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchTeams();
    else setPage(1);
  }, [topic, isMobile]);

  useEffect(() => {
    void fetchTeams();
  }, [page]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {loading && <PageTitle title="Loading..." size="medium" />}
      {teamCount && (
        <div className="font-bold tracking-tight">
          {teamCount} results found
        </div>
      )}
      {!teams && !loading && <EmptyMessage message="teams" />}
      <div className="flex w-4/5 flex-wrap items-center justify-center gap-6">
        {teams?.map((team) => <Team team={team} key={team.id} />)}
      </div>
      {teams && teamCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, teamCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SearchTeams;
