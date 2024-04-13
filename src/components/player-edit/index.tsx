import CheckIcon from "@mui/icons-material/Check";
import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { PlayerType } from "~/utils/types";
import Player from "../player";

type PlayerEditProps = {
  player: PlayerType;
};

const PlayerEdit = ({ player }: PlayerEditProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<number | null>(player.number);
  const [isValidNumber, setIsValidNumber] = useState<boolean>(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const num = Number(value);
    setEdit(num);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { data } = await supabase
      .from("affiliations")
      .update({
        number: edit,
      })
      .eq("id", player.id)
      .select();
    if (data) {
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const closeEdit = () => {
    setEdit(player.number);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setIsOpen(false);
    await supabase.from("affiliations").delete().eq("id", player.id);
  };

  useEffect(() => {
    if (!edit || edit < 0) {
      setIsValidNumber(false);
    } else {
      setIsValidNumber(true);
    }
  }, [edit]);

  return !isOpen ? (
    <div
      style={backgroundStyle}
      className="flex items-center justify-center gap-2 rounded-lg px-2"
    >
      <Player player={player} />
      <div className="flex">
        <Button size="small" onClick={() => setIsOpen(true)}>
          Edit
        </Button>
        <Button size="small" onClick={() => handleDelete()}>
          Delete
        </Button>
      </div>
    </div>
  ) : (
    <div
      className="flex items-center justify-center gap-4 rounded-lg p-2"
      style={backgroundStyle}
    >
      <div>{player.name}</div>
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
          value={edit ?? ""}
        />
        <Button type="submit" disabled={!isValidNumber}>
          <CheckIcon />
        </Button>
        <Button type="button" onClick={() => closeEdit()}>
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default PlayerEdit;
