import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputAdornment } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuthContext } from "~/contexts/auth";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import type { UnifiedPlayIndexType } from "~/utils/types";
import MentionInput from "../../utils/mentionInput";
import { sendMentionNotifications } from "../../utils/sendMentions";

// Assuming a simplified profile structure for email sending

type CommentProps = {
  play: UnifiedPlayIndexType;
  setReload: (reload: boolean) => void;
};

const AddComment = ({ play, setReload }: CommentProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [commentText, setCommentText] = useState<string>("");
  // NEW: State to hold the IDs of the users tagged in the comment
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);

  // NEW: Combined change handler from the MentionInput component
  const handleCommentChange = (value: string, mentionedIds: string[]) => {
    setCommentText(value);
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
      .from("comments")
      .insert({
        play_id: play.play_id,
        comment: commentText, // Use the state value
        comment_author: user.userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting comment:", error);
      return;
    }

    if (data) {
      // 2. Clear the input and state
      setCommentText("");
      setMentionedUserIds([]);
      setReload(true);

      // 3. Send notifications to mentioned users (if any)
      if (mentionedUserIds.length > 0) {
        // Filter out the sender if they somehow tagged themselves
        const recipients = mentionedUserIds.filter(
          (id) => id !== user.userId && id !== play.author_id,
        );
        await sendMentionNotifications(
          user.userId,
          recipients,
          data.id, // ID of the newly created comment
          "comment",
        );
      }

      // 4. Send email notification to the play author (original logic)
      if (play.author_email !== user.email && play.author_send_notifications) {
        await sendEmail({
          video: {
            id: play.video_id,
            exclusive_to: play.video_exclusive_to,
            private: !!play.video_exclusive_to,
            title: play.video_title,
          },
          comment: data,
          play: {
            private: play.private,
            title: play.play_title,
            note: play.play_note,
            id: play.play_id,
          },
          author: {
            name: `${user.name ? user.name : user.email!}`,
            email: user.email!,
          },
          title: `${
            user.name ? user.name : user.email!
          } commented on your play!`,
          recipient: {
            id: play.author_id,
            email: play.author_email,
          },
        });
      }
    }
  };

  useEffect(() => {
    // Check validity based on the comment text length
    setIsValid(commentText.trim().length > 0);
  }, [commentText]);

  return (
    <form
      className="flex w-full items-center justify-center gap-2"
      onSubmit={handleSubmit}
    >
      <MentionInput
        entityType="comment"
        teamId={play.exclusive_to} // Pass the team ID to fetch relevant users
        value={commentText}
        onChange={handleCommentChange} // Pass the new, combined handler
        label="Add a comment or reply... (@ to mention)"
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

export default AddComment;
