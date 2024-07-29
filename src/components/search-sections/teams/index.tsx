import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import Team from "~/components/team";
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

  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchTeams = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("teams")
      .select("*", { count: "exact" })
      .ilike("full_name", `%${topic}%`)
      .range(from, to);
    if (data && data.length > 0) setTeams(data);
    else setTeams(null);
    if (count) setTeamCount(count);
    else setTeamCount(null);
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
    <div className="mt-2 flex w-11/12 flex-col items-center justify-center gap-6">
      {!teams && <EmptyMessage size="large" message="teams" />}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {teams?.map((team) => <Team team={team} key={team.id} />)}
      </div>
      {teams && teamCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="medium"
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
