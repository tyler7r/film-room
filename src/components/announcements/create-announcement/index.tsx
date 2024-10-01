import { Button, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";
import FormMessage from "../../utils/form-message";

type CreateAnnouncementProps = {
  teamId: string;
  setIsOpen: (isOpen: boolean) => void;
};

const CreateAnnouncement = ({ setIsOpen, teamId }: CreateAnnouncementProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

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
    if (user.userId && user.name) {
      const { data } = await supabase
        .from("announcements")
        .insert({
          team_id: teamId,
          text: announcement,
          author_id: user.userId,
        })
        .select();
      if (data) {
        setMessage({ text: "Announcement sent!", status: "success" });
        setTimeout(() => {
          setIsOpen(false);
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
    } else {
      void router.push("/login");
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
      className="flex w-full flex-col items-center justify-center gap-4 text-center md:w-3/5 lg:w-1/2"
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
            setIsOpen(false);
            setAnnouncement("");
          }}
        >
          Close
        </Button>
      </div>
    </form>
  );
};

export default CreateAnnouncement;
