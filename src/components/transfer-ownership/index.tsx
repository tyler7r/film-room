import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType, PlayerType, TeamType } from "~/utils/types";
import FormMessage from "../form-message";
import PageTitle from "../page-title";

type ChangeOwnershipProps = {
  team: TeamType;
  isOpen: boolean;
  toggleOpen: (modal: string, open: boolean) => void;
};

const TransferOwnershipModal = ({
  team,
  isOpen,
  toggleOpen,
}: ChangeOwnershipProps) => {
  const { backgroundStyle, colorText } = useIsDarkContext();
  const { user } = useAuthContext();

  const [users, setUsers] = useState<PlayerType[] | null>(null);
  const [newRole, setNewRole] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState<string>("");

  const [isValid, setIsValid] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("user_view")
      .select("*")
      .match({ "affiliation->>verified": true, "team->>id": team.id })
      .neq("profile->>id", user.userId);
    if (data && data.length > 0) setUsers(data);
    else setUsers(null);
  };

  const fetchUserNewRole = async () => {
    if (user.userId) {
      const { data } = await supabase
        .from("affiliations")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.userId)
        .eq("verified", true)
        .maybeSingle();
      if (data) setNewRole(data.role);
    }
  };

  const handleChange = (e: SelectChangeEvent) => {
    const user = e.target.value;
    setNewOwner(user);
  };

  const handleClose = () => {
    setNewOwner("");
    toggleOpen("transferOwner", false);
    setMessage({ text: undefined, status: "error" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("teams")
      .update({ owner: newOwner })
      .eq("id", team.id)
      .select();
    if (data) handleClose();
    if (error)
      setMessage({
        text: `There was an error: ${error.message}.`,
        status: "error",
      });
  };

  useEffect(() => {
    if (newOwner === "") {
      setIsValid(false);
    } else setIsValid(true);
  }, [newOwner]);

  useEffect(() => {
    if (user.userId) void fetchUsers();
    void fetchUserNewRole();
  }, []);

  return (
    users && (
      <Modal open={isOpen} onClose={handleClose}>
        <Box
          className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-md border-solid p-4 md:w-3/5"
          sx={backgroundStyle}
        >
          <Button
            variant="text"
            size="large"
            sx={{
              position: "absolute",
              top: "0",
              right: "0",
              fontSize: "1.5rem",
              lineHeight: "2rem",
              fontWeight: "bold",
            }}
            onClick={handleClose}
          >
            X
          </Button>
          <PageTitle size="medium" title="Transfer Team Ownership" />
          <div className={`text-sm font-bold ${colorText}`}>
            * You will still be a {newRole} with {team.full_name} *
          </div>
          <form
            className="flex w-4/5 flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit}
          >
            <FormControl className="w-full">
              <InputLabel htmlFor="change-owner">Change Team Owner</InputLabel>
              <Select
                value={newOwner}
                onChange={handleChange}
                label="Change Team Owner"
                required
                name="change-owner"
                id="change-owner"
              >
                <MenuItem value="">None</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.profile.id} value={user.profile.id}>
                    {user.profile.name} - ({user.affiliation.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormMessage message={message} />
            <div className="flex items-center justify-center gap-4">
              <Button
                size="large"
                type="submit"
                variant="contained"
                disabled={!isValid}
              >
                Submit
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="outlined"
                size="large"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    )
  );
};

export default TransferOwnershipModal;
