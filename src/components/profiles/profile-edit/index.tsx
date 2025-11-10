import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton, Switch, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { UserType } from "~/utils/types";

type ProfileEditProps = {
  profile: UserType;
};

const ProfileEdit = ({ profile }: ProfileEditProps) => {
  const { user } = useAuthContext();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>(user.name ?? "");
  const [enabled, setEnabled] = useState<boolean>(profile.send_notifications);
  const [isValidName, setIsValidName] = useState<boolean>(false);

  const resetProfile = () => {
    setName(user.name ?? "");
    setEnabled(profile.send_notifications);
    setIsProfileEditOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);
  };

  const checkForUnEdited = () => {
    const nameCheck = name === "" ? null : name;
    const notifCheck = enabled === profile.send_notifications;
    if (nameCheck === user.name && notifCheck) {
      return true;
    } else {
      return false;
    }
  };

  const checkValidForm = () => {
    const isUnedited = checkForUnEdited();
    if (name === "" || isUnedited) {
      setIsValidName(false);
    } else {
      setIsValidName(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.id === user.userId)
      await supabase
        .from("profiles")
        .update({
          name: name,
          send_notifications: enabled,
        })
        .eq("id", profile.id)
        .select()
        .single();
    await supabase.auth.updateUser({
      data: {
        name: name,
      },
    });
    setIsProfileEditOpen(false);
  };

  useEffect(() => {
    void checkValidForm();
  }, [name, enabled]);

  return !isProfileEditOpen ? (
    <IconButton size="small" onClick={() => setIsProfileEditOpen(true)}>
      <SettingsIcon color="primary" />
    </IconButton>
  ) : (
    <ModalSkeleton
      title="Edit Profile"
      isOpen={isProfileEditOpen}
      handleClose={resetProfile}
      setIsOpen={setIsProfileEditOpen}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center justify-center gap-2"
      >
        <div className="flex w-4/5 flex-col items-center justify-center gap-4 p-2">
          <TextField
            className="w-full"
            name="name"
            autoComplete="name"
            required
            id="name"
            label="Name"
            onChange={handleInput}
            value={name}
            inputProps={{ maxLength: 100 }}
          />
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg font-bold">Allow Notifications?</div>
            <Switch
              checked={enabled}
              className="items-center justify-center"
              sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
              onChange={() => setEnabled(!enabled)}
            />
          </div>
        </div>
        <FormButtons
          submitTitle="SUBMIT"
          handleCancel={resetProfile}
          isValid={isValidName}
        />
      </form>
    </ModalSkeleton>
  );
};

export default ProfileEdit;
