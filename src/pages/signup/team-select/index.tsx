import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { type TeamType } from "~/utils/types";

const TeamSelect = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [team, setTeam] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};

  return isLoading ? (
    <div>Loading...</div>
  ) : teams ? (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormControl className="g-4 flex flex-col">
        <InputLabel>Team Select</InputLabel>
        <Select
          native={false}
          label="team-select"
          labelId="Team-Select"
          value={team}
          onChange={handleChange}
        >
          <MenuItem value={""}>None</MenuItem>
          {teams.map((team) => (
            <MenuItem value={team.id} key={team.id}>
              {team.city} {team.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained">Submit</Button>
    </form>
  ) : (
    <div>No teams</div>
  );
};

export default TeamSelect;
