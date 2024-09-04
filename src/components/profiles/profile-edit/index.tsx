import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  IconButton,
  Modal,
  Switch,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType, UserType } from "~/utils/types";

type ProfileEditProps = {
  profile: UserType;
};

const ProfileEdit = ({ profile }: ProfileEditProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
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

  const updateErrorMessage = () => {
    const isUnedited = checkForUnEdited();
    if (!isValidName) {
      if (name === "") {
        setMessage({
          status: "error",
          text: "Please enter a valid name!",
        });
        setIsValidName(false);
      } else if (isUnedited) {
        setMessage({
          status: "error",
          text: "Please make a change in order to submit the profile edit!",
        });
      } else {
        setMessage({ status: "error", text: undefined });
        setIsValidName(true);
      }
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
    checkValidForm();
  }, [name, enabled]);

  return !isProfileEditOpen ? (
    <IconButton size="small" onClick={() => setIsProfileEditOpen(true)}>
      <SettingsIcon color="primary" />
    </IconButton>
  ) : (
    <Modal open={isProfileEditOpen} onClose={resetProfile}>
      <Box
        className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid p-4"
        sx={backgroundStyle}
      >
        <Button
          variant="text"
          size="large"
          sx={{
            position: "absolute",
            right: "0",
            top: "0",
            fontWeight: "bold",
            fontSize: "24px",
            lineHeight: "32px",
          }}
          onClick={resetProfile}
        >
          X
        </Button>
        <PageTitle title="Edit Profile" size="medium" />
        <form
          onSubmit={handleSubmit}
          className="flex w-4/5 flex-col items-center justify-center gap-4 p-4 text-center"
        >
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
            <div className="text-lg font-bold">Allow Email Notifications</div>
            <Switch
              checked={enabled}
              className="items-center justify-center"
              sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
              onChange={() => setEnabled(!enabled)}
            />
          </div>
          <FormMessage message={message} />
          <div className="flex items-center justify-center gap-2">
            {isValidName ? (
              <Button variant="contained" size="large" type="submit">
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                type="button"
                onClick={() => updateErrorMessage()}
              >
                Edit Profile
              </Button>
            )}
            <Button
              type="button"
              variant="text"
              onClick={() => resetProfile()}
              size="large"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default ProfileEdit;
