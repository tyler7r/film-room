import { Divider, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import TeamLogo from "~/components/team-logo";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamType } from "~/utils/types";

type SearchTeamsProps = {
  topic: string;
};

const SearchTeams = ({ topic }: SearchTeamsProps) => {
  const { isMobile } = useMobileContext();
  const { affiliations } = useAffiliatedContext();
  const { user, setUser } = useAuthContext();
  const { isDark, backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchTeams = async () => {
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
  };

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>,
    teamId: string,
  ) => {
    e.stopPropagation();
    const isAffiliatedTeam = affiliations?.find(
      (aff) => aff.team.id === teamId,
    );
    if (isAffiliatedTeam && user.currentAffiliation) {
      setUser({ ...user, currentAffiliation: isAffiliatedTeam });
    }
    void router.push(`/team-hub/${teamId}`);
  };

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
      {!teams && <EmptyMessage message="teams" />}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {teams?.map((team) => (
          <div
            className={`flex cursor-pointer items-center justify-center gap-4 rounded-sm border-2 border-solid border-transparent p-4 px-6 transition ease-in-out hover:rounded-md hover:border-solid ${
              isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
            } hover:delay-100`}
            key={team.id}
            style={backgroundStyle}
            onClick={(e) => handleTeamClick(e, team.id)}
          >
            <TeamLogo tm={team} size={55} />
            <Divider variant="middle" orientation="vertical" flexItem />
            <div className="flex flex-col items-center justify-center">
              <div className="text-center text-2xl font-bold">
                {team.full_name}
              </div>
              {team.id === user.currentAffiliation?.team.id && (
                <div className="text-sm">ACTIVE</div>
              )}
            </div>
          </div>
        ))}
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
