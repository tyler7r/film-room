import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type MessageType, type TeamType } from "~/utils/types";

const TeamSelect = () => {
  const user = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [team, setTeam] = useState<string>("");
  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [isMultipleTeams, setIsMultipleTeams] = useState<boolean>(false);
  const [team2, setTeam2] = useState<string>("");

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select();
    setTeams(data);
    setIsLoading(false);
  };

  const handleChange = (e: SelectChangeEvent, t: number) => {
    if (t === 1) {
      setTeam(e.target.value);
      if (e.target.value === "") {
        setTeam2("");
      }
    } else {
      setTeam2(e.target.value);
    }
  };

  useEffect(() => {
    void fetchTeams();

    //Establish realtime updates for team list
    const channel = supabase
      .channel("team_db_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          void fetchTeams();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    tm: string,
  ) => {
    e.preventDefault();
    setIsValidForm(false);
    if (tm) console.log(tm);

    // Ensuring that only one team is selected join
    const teamFind = teams?.find((t) => t.id === tm);
    // Error boundary in case team data is not pulled initially somehow
    if (!teamFind)
      return setMessage({
        text: "No team found in the database.",
        status: "error",
      });

    const { data, error } = await supabase
      .from("affiliations")
      .insert({
        team_id: tm,
        user_id: `${user.userId}`,
      })
      .select()
      .single();

    if (data) {
      setMessage({
        text: `Successfully sent join request to ${teamFind.city} ${teamFind.name}. Team's account owner must approve your request.`,
        status: "success",
      });
    } else {
      setMessage({
        text: `There was an issue sending your request to ${teamFind.city} ${teamFind.name}. ${error?.message}`,
        status: "error",
      });
      setIsValidForm(true);
    }
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : teams ? (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <Typography variant="h1" fontSize={54}>
        Join a Team!
      </Typography>
      <form
        onSubmit={(e) => {
          void handleSubmit(e, team);
          void handleSubmit(e, team2);
        }}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
      >
        <FormControl className="g-4 flex w-full flex-col">
          <InputLabel>Team Select</InputLabel>
          <Select
            native={false}
            label="team-select"
            labelId="Team-Select"
            value={team}
            onChange={(e) => handleChange(e, 1)}
            className="w-full text-start"
          >
            <MenuItem value={""}>None</MenuItem>
            {teams
              .filter((t) => t.id !== team2)
              .map((team) => (
                <MenuItem value={team.id} key={team.id}>
                  {team.city} {team.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {isMultipleTeams && team && (
          <FormControl className="g-4 flex w-full flex-col">
            <InputLabel>Team 2 Select</InputLabel>
            <Select
              native={false}
              label="team-2-select"
              labelId="Team-2-Select"
              value={team2}
              onChange={(e) => handleChange(e, 2)}
              className="w-full text-start"
            >
              <MenuItem value={""}>None</MenuItem>
              {teams
                .filter((t) => t.id !== team)
                .map((tm) => (
                  <MenuItem value={tm.id} key={tm.id}>
                    {tm.city} {tm.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
        {team === "" ? (
          <Button
            type="button"
            variant="contained"
            disabled={!isValidForm}
            href="/"
          >
            Skip
          </Button>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              type="submit"
              variant="contained"
              className="mb-1"
              disabled={!isValidForm}
            >
              Submit
            </Button>
            <Typography variant="overline" fontSize="small">
              or
            </Typography>
            {!isMultipleTeams ? (
              <Button
                size="small"
                variant="outlined"
                className="mt-0"
                disabled={!isValidForm}
                onClick={() => setIsMultipleTeams(true)}
              >
                Join an additional team
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                className="mt-0"
                disabled={!isValidForm}
                onClick={() => {
                  setIsMultipleTeams(false);
                  setTeam2("");
                }}
              >
                Remove second team
              </Button>
            )}
          </div>
        )}
      </form>
      <FormMessage message={message} />
      <div className="flex items-center justify-center gap-1 p-2">
        <Typography variant="caption" fontSize="medium" className="">
          Don't see your team's account?
        </Typography>
        <Button
          variant="text"
          size="medium"
          href="/create-team"
          disabled={!isValidForm}
        >
          Create One
        </Button>
      </div>
    </div>
  ) : (
    <div>No teams</div>
  );
};

export default TeamSelect;
