import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Divider, IconButton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { AffiliationType, UserType } from "~/utils/types";
import DeleteMenu from "../delete-menu";
import User from "../user";

type UserEditProps = {
  user: UserType;
  goToProfile: boolean;
  affiliation: AffiliationType;
  small?: boolean;
};

const UserEdit = ({ user, goToProfile, small, affiliation }: UserEditProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const { setAffReload } = useAuthContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<number | null | undefined>(
    affiliation.number,
  );
  const [isValidNumber, setIsValidNumber] = useState<boolean>(false);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

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
      .eq("id", affiliation?.id)
      .select();
    if (data) {
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
      setAffReload(true);
    }
  };

  const closeEdit = () => {
    setEdit(affiliation.number);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setIsOpen(false);
    setIsDeleteMenuOpen(false);
    const { error } = await supabase
      .from("affiliations")
      .delete()
      .eq("id", affiliation.id);
    if (!error) setAffReload(true);
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
      className="flex items-center justify-center gap-1 rounded-lg px-2"
    >
      <User
        user={user}
        goToProfile={goToProfile}
        small={small}
        number={affiliation.number}
      />
      <Divider flexItem orientation="vertical" variant="middle" />
      <IconButton size="small" onClick={() => setIsOpen(true)}>
        <EditIcon color="primary" />
      </IconButton>
      <DeleteMenu
        isOpen={isDeleteMenuOpen}
        setIsOpen={setIsDeleteMenuOpen}
        handleDelete={handleDelete}
      />
    </div>
  ) : (
    <div
      className="flex items-center justify-center gap-4 rounded-lg p-2"
      style={backgroundStyle}
    >
      <div className={`font-bold`}>{user.name}</div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center gap-1"
      >
        <TextField
          size="small"
          name="num"
          autoComplete="num"
          required
          id="num"
          label="Number"
          type="number"
          autoFocus
          onChange={handleInput}
          value={edit ?? ""}
        />
        <IconButton size="small" type="submit" disabled={!isValidNumber}>
          <CheckIcon color="primary" />
        </IconButton>
        <IconButton size="small" type="button" onClick={() => closeEdit()}>
          <CloseIcon />
        </IconButton>
      </form>
    </div>
  );
};

export default UserEdit;
