import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { CommentType, UserType } from "~/utils/types";

type ReplyProps = {
  comment: CommentType;
  comment_author: UserType;
  setReload: (reload: boolean) => void;
};

const AddReply = ({ comment, comment_author, setReload }: ReplyProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [reply, setReply] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReply(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user.userId) {
      void router.push("/login");
    } else {
      const { data } = await supabase
        .from("replies")
        .insert({
          comment_id: comment.id,
          reply,
          author_id: user.userId,
        })
        .select();
      if (data) {
        setReply("");
        setReload(true);
      }
    }
  };

  useEffect(() => {
    if (reply !== "") {
      setIsValid(true);
    } else setIsValid(false);
  }, [reply]);

  return (
    <form
      className="flex w-full items-center justify-center gap-2"
      onSubmit={handleSubmit}
    >
      <TextField
        className="w-full"
        size="small"
        maxRows={4}
        label={`Reply to ${comment_author.name}`}
        name="reply"
        autoComplete="reply"
        autoFocus
        id="reply"
        onChange={changeHandler}
        value={reply}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              color="primary"
              type="submit"
              disabled={!isValid}
            >
              <SendIcon />
            </IconButton>
          ),
        }}
      />
    </form>
  );
};

export default AddReply;
