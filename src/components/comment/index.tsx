import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type CommentProps = {
  playId: string;
};

const AddComment = ({ playId }: CommentProps) => {
  const { user } = useAuthContext();
  const [comment, setComment] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setComment(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await supabase
      .from("comments")
      .insert({
        play_id: playId,
        comment,
        author_name: `${user.name}`,
        comment_author: `${user.currentAffiliation?.affId}`,
        team_id: `${user.currentAffiliation?.team.id}`,
      })
      .select();
    if (data) {
      console.log(data);
      setComment("");
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
        className="w-10/12"
        multiline
        maxRows={4}
        variant="filled"
        label="Comment"
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
