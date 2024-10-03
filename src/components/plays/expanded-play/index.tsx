import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentIndex from "~/components/interactions/comments/comment-index";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertFullTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionType, PlayPreviewType } from "~/utils/types";

type ExpandedPlayProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  commentCount: number;
  setCommentCount: (count: number) => void;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
};

const ExpandedPlay = ({
  play,
  commentCount,
  setCommentCount,
}: ExpandedPlayProps) => {
  const { hoverText } = useIsDarkContext();
  const { affIds } = useAuthContext();

  const router = useRouter();

  const [collections, setCollections] = useState<CollectionType[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchCollections = async () => {
    const colls = supabase
      .from("collection_plays_view")
      .select()
      .eq("play->>id", play.play.id);
    if (affIds && affIds.length > 0) {
      void colls.or(
        `collection->>private.eq.false, collection->>exclusive_to.in.(${affIds})`,
      );
    } else {
      void colls.eq("collection->>private", false);
    }
    const { data } = await colls;
    if (data && data.length > 0) {
      const cols: CollectionType[] = data.map(
        (collection) => collection.collection,
      );
      setCollections(cols);
    } else setCollections(null);
  };

  const handleClick = (id: string) => {
    void router.push(`/collections/${id}`);
  };

  useEffect(() => {
    const channel = supabase
      .channel("collection_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          void fetchCollections();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchCollections();
  }, [affIds]);

  return (
    <div className="flex w-full flex-col items-center gap-2 px-8">
      <div className="flex w-full items-start text-xs">
        <div>{convertFullTimestamp(play.play.created_at)}</div>
      </div>
      {play.play.note && (
        <div className="w-full">
          <strong
            onClick={() => void router.push(`/profile/${play.play.author_id}`)}
            className={`${hoverText} tracking-tight`}
          >
            Note:{" "}
          </strong>
          {play.play.note}
        </div>
      )}
      {collections && (
        <div className="flex w-full items-center justify-start gap-0.5">
          <IconButton
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            size="small"
          >
            <LibraryBooksIcon color="action" fontSize="small" />
            <StandardPopover
              content="Play Collections"
              handlePopoverClose={handlePopoverClose}
              open={open}
              anchorEl={anchorEl}
            />
          </IconButton>
          {collections.map((col) => (
            <Button
              key={col.id}
              style={{ fontWeight: "bold", padding: "2px", fontSize: "12px" }}
              onClick={() => handleClick(col.id)}
            >
              *{col.title}*
            </Button>
          ))}
        </div>
      )}
      <div className="flex w-full flex-col items-center gap-4">
        <AddComment play={play} />
        <CommentIndex
          playId={play.play.id}
          commentCount={commentCount}
          setCommentCount={setCommentCount}
        />
      </div>
    </div>
  );
};

export default ExpandedPlay;
