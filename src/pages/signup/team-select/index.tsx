import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { MessageType, type TeamType } from "~/utils/types";

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

  const handleChange = (e: SelectChangeEvent) => {
    setTeam(e.target.value);
  };

  useEffect(() => {
    fetchTeams();

    //Establish realtime updates for team list
    const channel = supabase
      .channel("team_db_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        async () => {
          const { data } = await supabase.from("teams").select();
          setTeams(data);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);
    console.log(user);

    // Ensuring that only one team is selected join
    if (teams && team2 === "") {
      const teamFind = teams.find((t) => t.id === team);
      // Error boundary in case team data is not pulled initially somehow
      if (!teamFind)
        return setMessage({
          text: "No team found in the database.",
          status: "error",
        });

      // Handle request depending on team's request state, empty, or occupied
      let requests = teamFind.member_requests;
      if (requests) {
        requests.push(`${user.email}`);
      } else {
        requests = [`${user.email}`];
      }

      // Update team's requests
      const { data, error } = await supabase
        .from("teams")
        .update({ member_requests: requests })
        .eq("id", team)
        .select();
      if (data) {
        setMessage({
          text: `Successfully sent join request to ${teamFind.city} ${teamFind.name}.`,
          status: "success",
        });
      } else {
        setMessage({
          text: `There was an issue sending your request. ${error.message}`,
          status: "error",
        });
        setIsValidForm(true);
      }
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
        onSubmit={handleSubmit}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
      >
        <FormControl className="g-4 flex w-full flex-col">
          <InputLabel>Team Select</InputLabel>
          <Select
            native={false}
            label="team-select"
            labelId="Team-Select"
            value={team}
            onChange={handleChange}
            className="w-full text-start"
          >
            <MenuItem value={""}>None</MenuItem>
            {teams.map((team) => (
              <MenuItem value={team.id} key={team.id}>
                {team.city} {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            <Button
              size="small"
              variant="outlined"
              className="mt-0"
              disabled={!isValidForm}
            >
              Join an additional team
            </Button>
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
