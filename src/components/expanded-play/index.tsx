import { useRouter } from "next/router";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentIndex from "~/components/interactions/comments/comment-index";
import { useIsDarkContext } from "~/pages/_app";
import type { PlayPreviewType } from "~/utils/types";

type ExpandedPlayProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  setCommentCount: (count: number) => void;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
};

const ExpandedPlay = ({ play, setCommentCount }: ExpandedPlayProps) => {
  const { hoverText } = useIsDarkContext();
  const router = useRouter();

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
      <div className="flex w-full flex-col items-center gap-4">
        <AddComment playId={play.play.id} />
        <CommentIndex playId={play.play.id} setCommentCount={setCommentCount} />
      </div>
    </div>
  );
};

export default ExpandedPlay;
