import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayType } from "~/utils/types";

type CommentProps = {
  play: PlayType;
};

const AddComment = ({ play }: CommentProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [comment, setComment] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setComment(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user.userId) {
      void router.push("/login");
    } else {
      const { data } = await supabase
        .from("comments")
        .insert({
          play_id: play.id,
          comment,
          author_name: user.name ? user.name : `${user.email}`,
          comment_author: user.userId,
        })
        .select();
      if (data) {
        setComment("");
      }
    }
  };

  useEffect(() => {
    if (comment !== "") {
      setIsValid(true);
    } else setIsValid(false);
  }, [comment]);

  return (
    <form
      className="flex w-full items-center justify-center gap-2"
      onSubmit={handleSubmit}
    >
      <TextField
        className="w-full"
        multiline
        size="small"
        maxRows={4}
        variant="standard"
        label="Add a comment..."
        name="comment"
        autoComplete="comment"
        id="comment"
        onChange={changeHandler}
        value={comment}
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

export default AddComment;
