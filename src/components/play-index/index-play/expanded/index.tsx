import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentIndex from "~/components/interactions/comments/comment-index";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { PlayPreviewType, TagType } from "~/utils/types";

type ExpandedPlayProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  setCommentCount: (count: number) => void;
  handleMentionAndTagClick: (e: React.MouseEvent, topic: string) => void;
};

const ExpandedPlay = ({
  play,
  activePlay,
  setCommentCount,
  handleMentionAndTagClick,
}: ExpandedPlayProps) => {
  const { hoverText } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [tags, setTags] = useState<TagType[] | null>(null);

  const fetchTags = async () => {
    const tags = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("play->>id", play.play.id);
    if (user.currentAffiliation?.team.id) {
      void tags.or(
        `tag->>private.eq.false, tag->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void tags.eq("tag->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  };

  useEffect(() => {
    void fetchTags();
  }, [activePlay]);

  return (
    <div className="flex w-full flex-col items-center gap-2 px-8">
      {play.play.note && (
        <div className="w-full">
          <strong
            onClick={() => void router.push(`/profile/${play.play.author_id}`)}
            className={hoverText}
          >
            Note:{" "}
          </strong>
          {play.play.note}
        </div>
      )}
      <div className="flex w-full gap-2">
        {tags?.map((tag) => (
          <Button
            key={tag.title + tag.id}
            size="small"
            onClick={(e) => handleMentionAndTagClick(e, tag.title)}
          >
            #{tag.title}
          </Button>
        ))}
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <AddComment playId={play.play.id} />
        <CommentIndex playId={play.play.id} setCommentCount={setCommentCount} />
      </div>
    </div>
  );
};

export default ExpandedPlay;
