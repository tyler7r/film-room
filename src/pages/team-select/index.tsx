import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SendIcon from "@mui/icons-material/Send";
import { Autocomplete, Button, Checkbox, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState, type SyntheticEvent } from "react";
import TeamLogo from "~/components/teams/team-logo";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType, TeamType } from "~/utils/types";

type TeamSelectType = {
  team: TeamType;
  isCoach: boolean;
  num: number | null;
};

const TeamSelect = () => {
  const router = useRouter();
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const { user, setAffReload, affIds } = useAuthContext();
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [teamSelect, setTeamSelect] = useState<TeamSelectType[] | null>(null);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: TeamType[],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMessage({ status: "error", text: undefined });
    if (newValue.length > (teamSelect?.length ?? 0)) {
      const val = newValue[newValue.length - 1];
      if (val) {
        const newTeam: TeamSelectType = {
          team: val,
          isCoach: false,
          num: null,
        };
        setTeamSelect(teamSelect ? [...teamSelect, newTeam] : [newTeam]);
      }
    } else if (newValue.length === 0) {
      setTeamSelect(null);
    } else {
      const tms: TeamSelectType[] = newValue.map((tm) => ({
        team: tm,
        isCoach: false,
        num: null,
      }));
      setTeamSelect(tms);
    }
  };

  const fetchTeams = async () => {
    const teams = supabase.from("teams").select();
    if (affIds) {
      void teams.not("id", "in", `(${affIds})`);
    }
    const { data } = await teams;
    if (data && data.length > 0) setTeams(data);
    else setTeams(null);
  };

  const handleNewAffiliation = async (
    teamName: string,
    teamId: string,
    isCoach: boolean,
    num: number | null,
  ) => {
    if (user.userId) {
      const { data, error } = await supabase
        .from("affiliations")
        .insert({
          team_id: teamId,
          user_id: user.userId,
          role: isCoach ? "coach" : "player",
          verified: false,
          number: num,
        })
        .select();
      if (data) {
        setMessage({
          text: `You successfully sent your request to join: ${teamName}.`,
          status: "success",
        });
      }
      if (error)
        setMessage({
          text: `There was a problem sending your join request to ${teamName}: ${error.message}`,
          status: "error",
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (teamSelect && teamSelect.length > 0) {
      teamSelect?.forEach((tm) => {
        void handleNewAffiliation(
          tm.team.full_name,
          tm.team.id,
          tm.isCoach,
          tm.num,
        );
      });
    }
    setTimeout(() => {
      void router.push("/");
      setAffReload(true);
    }, 2000);
  };

  useEffect(() => {
    void fetchTeams();
  }, []);

  useEffect(() => {
    if (!user.userId) void router.push("/login");
  }, [user.userId]);

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-2 p-4">
      <PageTitle size="large" title="Team Select" />
      {teams && (
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center justify-center gap-6 p-4"
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Autocomplete
              className="w-4/5"
              id="teams"
              onChange={(event, newValue) => handleChange(event, newValue)}
              options={teams}
              getOptionLabel={(option) =>
                `${option.full_name} (${option.division})`
              }
              filterSelectedOptions
              multiple
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Teams"
                  placeholder="Teams..."
                  id="teams"
                  name="teams"
                />
              )}
              limitTags={3}
            />
          </div>
          {teamSelect && (
            <div className="flex w-4/5 flex-col items-center justify-center gap-4 md:w-3/5 lg:w-1/2">
              <PageTitle title="Adjust Your Team Roles" size="small" />
              {teamSelect.map((team) => (
                <div
                  key={team.team.id}
                  className="flex flex-col items-center justify-center gap-4 rounded-md p-4"
                  style={backgroundStyle}
                >
                  <div className="flex items-center justify-center gap-4">
                    <TeamLogo tm={team.team} size={35} />
                    <PageTitle size="x-small" title={team.team.full_name} />
                    <div className="flex flex-col items-center justify-center">
                      <div className="-mb-2 text-sm font-bold tracking-tight">
                        COACH?
                      </div>
                      <Checkbox
                        value={team.isCoach}
                        onChange={() => {
                          const copy = [...teamSelect];
                          const find = copy.findIndex(
                            (val) => val.team.id === team.team.id,
                          );
                          const tm = copy[find];
                          if (tm) tm.isCoach = !tm.isCoach;
                          setTeamSelect(copy);
                        }}
                        checked={team.isCoach}
                        className="w-full text-start"
                        id="user-role"
                        name="role"
                        size="small"
                      />
                    </div>
                  </div>
                  {!team.isCoach && (
                    <TextField
                      size="small"
                      name="num"
                      autoComplete="num"
                      id="num"
                      label="Player Number"
                      type="number"
                      value={team.num ?? ""}
                      onChange={(e) => {
                        const { value } = e.target;
                        const copy = [...teamSelect];
                        const find = copy.findIndex(
                          (val) => val.team.id === team.team.id,
                        );
                        const tm = copy[find];
                        if (tm) tm.num = value === "" ? null : Number(value);
                        setTeamSelect(copy);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <FormMessage message={message} />
          {teamSelect ? (
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon fontSize="small" />}
            >
              Send Join Requests
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              endIcon={<KeyboardDoubleArrowRightIcon fontSize="small" />}
            >
              Continue w/ no affiliations
            </Button>
          )}
        </form>
      )}
      {!teams && (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`text-2xl font-bold`}>
            {affIds
              ? "You have joined all active team accounts."
              : `No teams in the database!`}
          </div>
          <Button
            type="submit"
            variant="contained"
            endIcon={<KeyboardDoubleArrowRightIcon fontSize="small" />}
          >
            {affIds ? "Continue" : "Continue w/ no affiliations"}
          </Button>
        </div>
      )}
      <div className="items-center justify-center text-xl">
        <div className="text-center">
          Don't see your team?{" "}
          <strong
            onClick={() => void router.push("/create-team")}
            className={`${hoverText} tracking-tight`}
          >
            Create It!
          </strong>
        </div>
      </div>
    </div>
  );
};

export default TeamSelect;
