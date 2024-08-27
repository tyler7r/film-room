import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Divider, IconButton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { AffiliationType, UserType } from "~/utils/types";
import User from "../user";
import DeleteMenu from "../utils/delete-menu";
import PageTitle from "../utils/page-title";

type UserEditProps = {
  user: UserType;
  goToProfile: boolean;
  affiliation: AffiliationType;
  small?: boolean;
  setRosterReload: (rosterReload: boolean) => void;
};

const UserEdit = ({
  user,
  goToProfile,
  small,
  affiliation,
  setRosterReload,
}: UserEditProps) => {
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
    if (!error) {
      setAffReload(true);
      setRosterReload(true);
    }
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
      className="flex items-center justify-center gap-1 px-2"
    >
      <User
        user={user}
        goToProfile={goToProfile}
        small={small}
        number={affiliation.number}
        coach={affiliation.role === "coach" ? true : false}
      />
      <Divider flexItem orientation="vertical" variant="middle" />
      <div className="flex flex-col items-center justify-center p-2">
        <div className="text-xs font-bold leading-3 tracking-tight">EDIT</div>
        <div className="flex gap-2 leading-3">
          <IconButton size="small" onClick={() => setIsOpen(true)}>
            <EditIcon color="primary" />
          </IconButton>
          <DeleteMenu
            isOpen={isDeleteMenuOpen}
            setIsOpen={setIsDeleteMenuOpen}
            handleDelete={handleDelete}
            deleteType="user from team"
          />
        </div>
      </div>
    </div>
  ) : (
    <div
      className="flex items-center justify-center gap-4 rounded-md p-2"
      style={backgroundStyle}
    >
      <div>
        <PageTitle size="x-small" title={user.name} />
      </div>
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
