import CheckIcon from "@mui/icons-material/Check";
import { Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { type TeamHubType } from "~/utils/types";
import Player from "../player";

type RosterProps = {
  team: TeamHubType;
  role: string;
};

export type RosterType = {
  id: string;
  name?: string | null;
  num: number | null;
};

const Roster = ({ team, role }: RosterProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const [roster, setRoster] = useState<RosterType[] | undefined>(undefined);
  const [edit, setEdit] = useState<RosterType>({
    id: "",
    num: null,
  });
  const [isValidNumber, setIsValidNumber] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEdit({
      ...edit,
      [name]: value,
    });
  };

  const closeEdit = () => {
    setEdit({
      id: "",
      num: null,
    });
  };

  const fetchRoster = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select("number, user_id, profiles(name)")
      .match({
        team_id: team?.id,
        role: "player",
        verified: true,
      });
    if (data && data.length > 0) {
      const roster: RosterType[] = data?.map((p) => {
        return { id: p.user_id, name: p.profiles?.name, num: p.number };
      });
      setRoster(roster);
    } else {
      setRoster(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await supabase
      .from("affiliations")
      .update({
        number: edit.num,
      })
      .match({ team_id: team?.id, user_id: edit.id })
      .select();
    if (data) {
      void fetchRoster();
      setTimeout(() => {
        closeEdit();
      }, 300);
    }
  };

  useEffect(() => {
    void fetchRoster();
  }, [team?.id]);

  useEffect(() => {
    if (edit.num === null || edit.num < 0) {
      setIsValidNumber(false);
    } else {
      setIsValidNumber(true);
    }
  }, [edit.num]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <Typography variant="h2" fontSize={42}>
        Roster
      </Typography>
      {!roster && (
        <Typography
          variant="button"
          fontSize={14}
          style={backgroundStyle}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-1"
        >
          No Active Player Accounts
        </Typography>
      )}
      <div className="flex flex-wrap gap-2">
        {role === "player" &&
          roster?.map((p) => <Player key={p.id} player={p} />)}
        {role !== "player" &&
          roster?.map((p) =>
            edit?.id !== p.id ? (
              <div
                key={p.id}
                style={backgroundStyle}
                className="flex items-center justify-center gap-2 rounded-lg px-2"
              >
                <Player player={p} />
                <div className="flex">
                  <Button size="small" onClick={() => setEdit(p)}>
                    Edit
                  </Button>
                  <Button size="small">Delete</Button>
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="flex items-center justify-center gap-4 rounded-lg p-2"
                style={backgroundStyle}
              >
                <Typography>{p.name}</Typography>
                <form onSubmit={handleSubmit}>
                  <TextField
                    size="small"
                    name="num"
                    autoComplete="num"
                    required
                    id="num"
                    label="Jersey Number"
                    type="number"
                    autoFocus
                    onChange={handleInput}
                    value={edit.num ?? ""}
                  />
                  <Button type="submit" disabled={!isValidNumber}>
                    <CheckIcon />
                  </Button>
                  <Button type="button" onClick={() => closeEdit()}>
                    Cancel
                  </Button>
                </form>
              </div>
            ),
          )}
      </div>
    </div>
  );
};

export default Roster;
