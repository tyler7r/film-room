import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type CommentProps = {
  playId: string;
};

const AddComment = ({ playId }: CommentProps) => {
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
    if (!user.isLoggedIn || !user.userId) {
      void router.push("/login");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({
        play_id: playId,
        comment,
        author_name: `${user.name}`,
        comment_author: user.userId,
        team_id: user.currentAffiliation?.team.id ?? null,
      })
      .select();
    if (data) {
      setComment("");
    }
    if (error) console.log(error.message);
  };

  useEffect(() => {
    if (comment !== "") {
      setIsValid(true);
    } else setIsValid(false);
  }, [comment]);

  return (
    <form
      className="flex w-full items-center justify-center gap-2 px-6"
      onSubmit={handleSubmit}
    >
      <TextField
        className="w-full"
        multiline
        maxRows={4}
        variant="filled"
        label="New Comment"
        name="comment"
        autoComplete="comment"
        id="comment"
        onChange={changeHandler}
        value={comment}
      />
      <IconButton color="primary" type="submit" disabled={!isValid}>
        <SendIcon fontSize="large" />
      </IconButton>
    </form>
  );
};

export default AddComment;
