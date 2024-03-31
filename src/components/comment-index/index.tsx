import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type CommentIndexProps = {
  playId: string;
  setCommentCount: (count: number) => void;
};

type CommentIndexType = {
  author_name: string;
  comment: string;
  comment_author: string;
  created_at: string;
  id: string;
  play_id: string;
  team_id: string | null;
}[];

const CommentIndex = ({ playId, setCommentCount }: CommentIndexProps) => {
  const { user } = useAuthContext();
  const [index, setIndex] = useState<CommentIndexType | null>(null);

  const fetchComments = async () => {
    const { data, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .match({
        team_id: `${user.currentAffiliation?.team.id}`,
        play_id: playId,
      });
    if (data) setIndex(data);
    if (count) setCommentCount(count);
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void fetchComments();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchComments();
  }, []);

  return index?.map((comment) => (
    <div key={comment.id}>
      <div>{comment.author_name}</div>
      <div>{comment.comment}</div>
    </div>
  ));
};

export default CommentIndex;
