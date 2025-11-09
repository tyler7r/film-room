import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SendIcon from "@mui/icons-material/Send";
import { Autocomplete, Box, Button, Checkbox, TextField } from "@mui/material";
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

// --- HELPER FUNCTION TO SEND REQUEST EMAIL ---
const sendRequestEmail = async (team: TeamType, requesterName: string) => {
  // 1. Fetch the team owner's profile
  const { data: ownerProfile, error: ownerError } = await supabase
    .from("profiles")
    .select("id, email, name")
    .eq("id", team.owner)
    .single();

  if (ownerError ?? !ownerProfile) {
    console.error("Failed to fetch team owner for notification:", ownerError);
    return;
  }

  // 2. Count current pending requests (including the one just sent)
  const { count } = await supabase
    .from("affiliations")
    .select("*", { count: "exact" })
    .match({ team_id: team.id, verified: false });

  // 3. Send notification to the owner
  try {
    const response = await fetch("/api/team-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "new_request",
        title: `⭐ New Join Request for ${team.full_name}`,
        team: {
          id: team.id,
          full_name: team.full_name,
        },
        latestRequester: {
          name: requesterName,
        },
        requestCount: count ?? 1, // At least 1 (the current one)
        recipient: {
          id: ownerProfile.id,
          email: ownerProfile.email,
        },
      }),
    });
    if (!response.ok) {
      console.error("Team request email API failed:", await response.json());
    }
  } catch (error) {
    console.error("Failed to send team request email:", error);
  }
};
// --- END HELPER FUNCTION ---

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
      // Handles removal of items
      const tms: TeamSelectType[] = newValue.map((tm) => {
        // Find existing state to preserve isCoach/num if possible
        const existing = teamSelect?.find(
          (selected) => selected.team.id === tm.id,
        );
        return existing ?? { team: tm, isCoach: false, num: null };
      });
      setTeamSelect(tms);
    }
  };

  const fetchTeams = async () => {
    // Fetch all teams
    const teamsQuery = supabase.from("teams").select();

    // Filter out teams the user is already affiliated with
    if (affIds && affIds.length > 0) {
      // Supabase supports not equal to array value 'not'('id', 'in', '(id1, id2, ...)')
      // Since affIds is a string array, we join them for the 'in' clause.
      void teamsQuery.not("id", "in", `(${affIds.join(",")})`);
    }

    const { data } = await teamsQuery;
    if (data && data.length > 0) setTeams(data as TeamType[]);
    else setTeams(null);
  };

  const handleNewAffiliation = async (
    team: TeamType, // Passed the full team object now
    isCoach: boolean,
    num: number | null,
  ) => {
    if (user.userId) {
      const { data, error } = await supabase
        .from("affiliations")
        .insert({
          team_id: team.id,
          user_id: user.userId,
          role: isCoach ? "coach" : "player",
          verified: false,
          number: num,
        })
        .select();
      if (data) {
        setMessage({
          text: `You successfully sent your request to join: ${team.full_name}.`,
          status: "success",
        });

        // --- Notify the team owner ---
        void sendRequestEmail(team, user.name ?? user.email!);
        // -----------------------------
      }
      if (error)
        setMessage({
          text: `There was a problem sending your join request to ${team.full_name}: ${error.message}`,
          status: "error",
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (teamSelect && teamSelect.length > 0) {
      // Process all selected teams concurrently
      await Promise.all(
        teamSelect.map((tm) =>
          handleNewAffiliation(tm.team, tm.isCoach, tm.num),
        ),
      );
    }
    // Redirect after a short delay to allow the message to show
    setTimeout(() => {
      void router.push("/");
      setAffReload(true); // Trigger a reload of affiliations on the next page
    }, 1000);
  };

  useEffect(() => {
    void fetchTeams();
    // Only run once on mount, or when affIds change (to update available teams)
  }, [affIds]);

  useEffect(() => {
    if (!user.userId) {
      // Redirect if user somehow lands here without a userId
      void router.push("/login");
    }
  }, [user.userId]);

  return (
    // Replaced outer div with Box
    <Box className="mt-10 flex w-full flex-col items-center justify-center gap-2 p-4">
      <PageTitle size="large" title="Team Select" />
      {teams && (
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center justify-center gap-6 p-4"
        >
          {/* Autocomplete Section */}
          <Box className="flex w-full flex-col items-center justify-center gap-4">
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
                  placeholder="Select teams to join..."
                  id="teams"
                  name="teams"
                />
              )}
              limitTags={3}
              // Set value to currently selected TeamType objects based on teamSelect
              value={teamSelect ? teamSelect.map((ts) => ts.team) : []}
            />
          </Box>

          {/* Role/Number Select Section */}
          {teamSelect && (
            <Box
              className="flex w-4/5 flex-col items-center justify-center gap-4 rounded-xl p-6 shadow-xl md:w-3/5 lg:w-1/2"
              style={backgroundStyle}
            >
              <PageTitle title="Adjust Your Roles" size="small" />
              {teamSelect.map((team, index) => (
                <Box
                  key={team.team.id}
                  className="flex w-full flex-col items-center justify-center gap-4 rounded-md border-2 p-4"
                  style={{ borderColor: backgroundStyle.backgroundColor }}
                >
                  <Box className="flex w-full items-center justify-between gap-4">
                    <TeamLogo tm={team.team} size={35} />
                    <PageTitle size="x-small" title={team.team.full_name} />

                    {/* Coach Checkbox */}
                    <Box className="flex flex-col items-center justify-center">
                      <div className="-mb-2 text-sm font-bold tracking-tight">
                        COACH?
                      </div>
                      <Checkbox
                        value={team.isCoach}
                        onChange={() => {
                          const copy = [...teamSelect];
                          const tm = copy[index];
                          if (tm) tm.isCoach = !tm.isCoach;
                          setTeamSelect(copy);
                        }}
                        checked={team.isCoach}
                        className="w-full text-start"
                        id={`user-role-${team.team.id}`}
                        name="role"
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Player Number Input */}
                  {!team.isCoach && (
                    <TextField
                      size="small"
                      name="num"
                      autoComplete="num"
                      id={`num-${team.team.id}`}
                      label="Player Number"
                      type="number"
                      // Ensure value is controlled; default to empty string if null
                      value={team.num ?? ""}
                      onChange={(e) => {
                        const { value } = e.target;
                        const copy = [...teamSelect];
                        const tm = copy[index];
                        if (tm) tm.num = value === "" ? null : Number(value);
                        setTeamSelect(copy);
                      }}
                      className="w-full max-w-xs"
                      inputProps={{ min: 0 }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Form Status Message */}
          <FormMessage message={message} />

          {/* Submit/Continue Button */}
          {teamSelect && teamSelect.length > 0 ? (
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon fontSize="small" />}
              color="primary"
            >
              Send Join Requests ({teamSelect.length})
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              endIcon={<KeyboardDoubleArrowRightIcon fontSize="small" />}
              color="primary"
            >
              Continue w/ no affiliations
            </Button>
          )}
        </form>
      )}

      {/* No Teams Available Section */}
      {!teams && (
        <Box className="flex flex-col items-center justify-center gap-4 p-4">
          <div className={`text-center text-2xl font-bold`}>
            {/* Check if affIds is null/undefined or an empty array */}
            {affIds && affIds.length > 0
              ? "You are affiliated with all active teams."
              : `No teams are currently in the database!`}
          </div>
          <Button
            onClick={() => void router.push("/")}
            variant="contained"
            endIcon={<KeyboardDoubleArrowRightIcon fontSize="small" />}
            color="secondary"
          >
            Go to Home
          </Button>
        </Box>
      )}

      {/* Create Team Link */}
      <Box className="items-center justify-center pt-4 text-xl">
        <div className="text-center">
          Don't see your team?{" "}
          <strong
            onClick={() => void router.push("/create-team")}
            className={`${hoverText} cursor-pointer tracking-tight`}
          >
            Create It!
          </strong>
        </div>
      </Box>
    </Box>
  );
};

export default TeamSelect;
