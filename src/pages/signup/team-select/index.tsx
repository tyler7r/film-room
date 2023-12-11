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
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type TeamType } from "~/utils/types";

const TeamSelect = () => {
  const user = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [team, setTeam] = useState<string>("");
  const [isValidForm, setIsValidForm] = useState<boolean>(true);

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
    console.log(user);
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
          <Button type="submit" variant="contained" disabled={!isValidForm}>
            Skip
          </Button>
        ) : (
          <Button type="submit" variant="contained" disabled={!isValidForm}>
            Submit
          </Button>
        )}
      </form>
      <div>
        <div className="mt-2 flex flex-col items-center justify-center gap-2">
          <div className="">Don't see your team's account?</div>
          <Button variant="outlined" size="small" href="/create-team">
            Create One
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div>No teams</div>
  );
};

export default TeamSelect;
