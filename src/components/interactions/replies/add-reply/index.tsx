import SendIcon from "@mui/icons-material/Send";
import { IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType, UserType } from "~/utils/types";

type ReplyProps = {
  comment: CommentNotificationType;
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
          comment_id: comment.comment.id,
          reply,
          author_id: user.userId,
        })
        .select()
        .single();
      if (data) {
        setReply("");
        setReload(true);
        if (
          comment.author.email !== user.email &&
          comment.author.send_notifications
        ) {
          await sendEmail({
            video: comment.video,
            comment: comment.comment,
            reply: data,
            play: comment.play,
            author: {
              name: `${user.name ? user.name : user.email!}`,
              email: user.email!,
            },
            title: `${
              user.name ? user.name : user.email!
            } replied to your comment!`,
            recipient: comment.author,
          });
        }
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
