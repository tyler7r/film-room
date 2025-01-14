import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType, PlayerType, TeamType } from "~/utils/types";
import FormMessage from "../../utils/form-message";

type TransferTeamOwnershipProps = {
  team: TeamType;
  isOpen: boolean;
  setRole: (role: string) => void;
  setIsOpen: (isOpen: boolean) => void;
};

const TransferTeamOwnershipModal = ({
  team,
  isOpen,
  setRole,
  setIsOpen,
}: TransferTeamOwnershipProps) => {
  const { colorText } = useIsDarkContext();
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
    setIsOpen(false);
    setMessage({ text: undefined, status: "error" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("teams")
      .update({ owner: newOwner })
      .eq("id", team.id)
      .select();
    if (data) {
      handleClose();
      setRole(newRole ? newRole : "guest");
    }
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
      <ModalSkeleton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Transfer Team Ownership"
      >
        {newRole ? (
          <div className={`text-sm font-bold tracking-tight ${colorText}`}>
            * You will still be a {newRole} with {team.full_name} *
          </div>
        ) : (
          <div className={`text-sm font-bold tracking-tight ${colorText}`}>
            * You will no longer be a member of {team.full_name}, as you are not
            a registered player or coach *
          </div>
        )}
        <form
          className="flex w-full flex-col items-center justify-center gap-2"
          onSubmit={handleSubmit}
        >
          <FormControl className="flex w-4/5 flex-col p-2">
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
          <FormButtons
            submitTitle="SUBMIT"
            handleCancel={handleClose}
            isValid={isValid}
          />
        </form>
      </ModalSkeleton>
    )
  );
};

export default TransferTeamOwnershipModal;
