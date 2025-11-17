import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputAdornment } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthContext } from "~/contexts/auth";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType, UserType } from "~/utils/types";
import MentionInput from "../../utils/mentionInput";
import { sendMentionNotifications } from "../../utils/sendMentions";

// Assuming a simplified profile structure for email sending

type ReplyProps = {
  comment: CommentNotificationType;
  comment_author: UserType;
  setReload: (reload: boolean) => void;
};

const AddReply = ({ comment, comment_author, setReload }: ReplyProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [replyText, setReplyText] = useState<string>("");
  // NEW: State to hold the IDs of the users tagged in the comment
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);

  // NEW: Combined change handler from the MentionInput component
  const handleReplyChange = (value: string, mentionedIds: string[]) => {
    setReplyText(value);
    setMentionedUserIds(mentionedIds);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user.userId) {
      void router.push("/login");
      return;
    }

    if (!isValid) return;

    // 1. Insert the comment into Supabase
    const { data, error } = await supabase
      .from("replies")
      .insert({
        comment_id: comment.comment.id,
        reply: replyText, // Use the state value
        author_id: user.userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting comment:", error);
      return;
    }

    if (data) {
      // 2. Clear the input and state
      setReplyText("");
      setMentionedUserIds([]);
      setReload(true);

      // 3. Send notifications to mentioned users (if any)
      if (mentionedUserIds.length > 0) {
        // Filter out the sender if they somehow tagged themselves
        const recipients = mentionedUserIds.filter(
          (id) => id !== user.userId && id !== comment_author.id,
        );
        await sendMentionNotifications(
          user.userId,
          recipients,
          data.id, // ID of the newly created comment
          "reply",
        );
      }

      // 4. Send email notification to the play author (original logic)
      if (
        comment_author.email !== user.email &&
        comment_author.send_notifications
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
  };

  useEffect(() => {
    // Check validity based on the comment text length
    setIsValid(replyText.trim().length > 0);
  }, [replyText]);

  return (
    <form
      className="flex w-full items-center justify-center gap-2"
      onSubmit={handleSubmit}
    >
      <MentionInput
        entityType="reply"
        teamId={comment.play.exclusive_to} // Pass the team ID to fetch relevant users
        value={replyText}
        onChange={handleReplyChange} // Pass the new, combined handler
        label="Add a reply... (@ to mention)"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              size="small"
              color="primary"
              type="submit"
              disabled={!isValid}
            >
              <SendIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </form>
  );
};

export default AddReply;
