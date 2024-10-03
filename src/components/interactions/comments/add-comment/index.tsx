import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

type CommentProps = {
  play: PlayPreviewType;
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
          play_id: play.play.id,
          comment,
          comment_author: user.userId,
        })
        .select()
        .single();
      if (data) {
        setComment("");
        if (
          play.author.email !== user.email &&
          play.author.send_notifications
        ) {
          await sendEmail({
            video: play.video,
            comment: data,
            play: play.play,
            author: {
              name: `${user.name ? user.name : user.email!}`,
              email: user.email!,
            },
            title: `${
              user.name ? user.name : user.email!
            } commented on your play!`,
            recipient: play.author,
          });
        }
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
