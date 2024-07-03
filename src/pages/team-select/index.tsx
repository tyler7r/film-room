import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type MessageType, type TeamType } from "~/utils/types";

type TeamSelectType = {
  id: string;
  isCoach: boolean;
};

const TeamSelect = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [team, setTeam] = useState<TeamSelectType>({
    id: "",
    isCoach: false,
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [isMultipleTeams, setIsMultipleTeams] = useState<boolean>(false);
  const [team2, setTeam2] = useState<TeamSelectType>({
    id: "",
    isCoach: false,
  });

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select();
    setTeams(data);
    setIsLoading(false);
  };

  const handleChange = (e: SelectChangeEvent, t: number) => {
    if (t === 1) {
      setTeam({ ...team, id: e.target.value });
      if (e.target.value === "") {
        setTeam2({ id: "", isCoach: false });
      }
    } else {
      setTeam2({ ...team2, id: e.target.value });
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
    tm: TeamSelectType,
  ) => {
    e.preventDefault();
    setIsValidForm(false);

    if (tm.id !== "") {
      // Ensuring that only one team is selected join
      const teamFind = teams?.find((t) => t.id === tm.id);
      // Error boundary in case team data is not pulled initially somehow
      if (!teamFind)
        return setMessage({
          text: "No team found in the database.",
          status: "error",
        });

      const { error } = await supabase
        .from("affiliations")
        .insert({
          team_id: tm.id,
          user_id: `${user.userId}`,
          role: `${tm.isCoach ? "coach" : "player"}`,
        })
        .select()
        .single();

      if (!error) {
        setMessage({
          text: `Successfully sent join request to ${teamFind.full_name}. Team's account owner must approve your request.`,
          status: "success",
        });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage({
          text: `There was an issue sending your request to ${teamFind.full_name}.`,
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
        onSubmit={(e) => {
          void handleSubmit(e, team);
          void handleSubmit(e, team2);
        }}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
      >
        <FormControl className="g-4 flex w-full flex-col">
          <InputLabel htmlFor="team-select">Team Select</InputLabel>
          <Select
            native={false}
            label="team-select"
            labelId="Team-Select"
            value={team.id}
            onChange={(e) => handleChange(e, 1)}
            className="w-full text-start"
            name="team-select"
            id="team-select"
          >
            <MenuItem value={""}>None</MenuItem>
            {teams
              .filter((t) => t.id !== team2.id)
              .map((team) => (
                <MenuItem value={team.id} key={team.id}>
                  {team.city} {team.name}
                </MenuItem>
              ))}
          </Select>
          {team.id && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={team.isCoach}
                  onChange={() => setTeam({ ...team, isCoach: !team.isCoach })}
                  size="medium"
                  name="is-coach-1"
                  id="is-coach-1"
                />
              }
              labelPlacement="start"
              label={<div className="text-lg font-bold">Are you a coach?</div>}
            />
          )}
        </FormControl>
        {isMultipleTeams && team && (
          <FormControl className="g-4 flex w-full flex-col">
            <InputLabel htmlFor="team-2-select">Team 2 Select</InputLabel>
            <Select
              native={false}
              label="team-2-select"
              labelId="Team-2-Select"
              value={team2.id}
              onChange={(e) => handleChange(e, 2)}
              className="w-full text-start"
              id="team-2-select"
              name="team-2-select"
            >
              <MenuItem value={""}>None</MenuItem>
              {teams
                .filter((t) => t.id !== team.id)
                .map((tm) => (
                  <MenuItem value={tm.id} key={tm.id}>
                    {tm.full_name}
                  </MenuItem>
                ))}
            </Select>
            {team2.id && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={team2.isCoach}
                    onChange={() =>
                      setTeam2({ ...team2, isCoach: !team2.isCoach })
                    }
                    size="medium"
                    id="is-coach-2"
                    name="is-coach-2"
                  />
                }
                labelPlacement="start"
                label={
                  <div className="text-lg font-bold">Are you a coach?</div>
                }
              />
            )}
          </FormControl>
        )}
        {team.id === "" ? (
          <Button
            type="button"
            variant="contained"
            disabled={!isValidForm}
            onClick={() => router.push("/")}
          >
            Continue w/ No Team
          </Button>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              type="submit"
              variant="contained"
              sx={{ marginBottom: "4px" }}
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
                sx={{ marginTop: "0px" }}
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
                  setTeam2({ id: "", isCoach: false });
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
        <Typography variant="caption" fontSize="medium">
          Don't see your team's account?
        </Typography>
        <Button
          variant="text"
          size="medium"
          onClick={() => router.push("/create-team")}
          disabled={!isValidForm}
        >
          Create One
        </Button>
      </div>
    </div>
  ) : (
    <div className="mt-5 text-center text-5xl">Loading...</div>
  );
};

export default TeamSelect;
