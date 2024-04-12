import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type MessageType, type TeamType } from "~/utils/types";
import FormMessage from "../form-message";

type AnnouncementProps = {
  team: TeamType | null;
  toggleOpen: (modal: string, open: boolean) => void;
};

const Announcement = ({ toggleOpen, team }: AnnouncementProps) => {
  const { user } = useAuthContext();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [announcement, setAnnouncement] = useState("");
  const [isValidAnnouncement, setIsValidAnnouncement] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAnnouncement(value);
  };

  const handleAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await supabase
      .from("announcements")
      .insert({
        team_id: `${team?.id}`,
        text: announcement,
        author_name: user.name!,
        author_id: user.userId,
      })
      .select();
    if (data) {
      setMessage({ text: "Announcement sent!", status: "success" });
      setTimeout(() => {
        toggleOpen("announcement", false);
        setIsValidAnnouncement(false);
        setAnnouncement("");
        setMessage({ text: undefined, status: "error" });
      }, 1000);
    } else {
      setMessage({
        text: "There was an error sending the announcement!",
        status: "error",
      });
      setIsValidAnnouncement(true);
    }
  };

  useEffect(() => {
    if (announcement !== "") {
      setIsValidAnnouncement(true);
    } else {
      setIsValidAnnouncement(false);
    }
  }, [announcement]);

  return (
    <form
      onSubmit={handleAnnouncement}
      className="m-2 flex w-full flex-col items-center justify-center gap-4 text-center"
    >
      <TextField
        multiline={true}
        className="w-full"
        name="announcement"
        autoComplete="announcement"
        required
        id="announcement"
        label="Announcement"
        type={"textarea"}
        autoFocus
        onChange={handleInput}
        value={announcement}
      />
      <FormMessage message={message} />
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="contained"
          disabled={!isValidAnnouncement}
        >
          Send
        </Button>
        <Button
          type="button"
          onClick={() => {
            toggleOpen("announcement", false);
            setAnnouncement("");
          }}
        >
          Close
        </Button>
      </div>
    </form>
  );
};

export default Announcement;
