import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentIndex from "~/components/interactions/comments/comment-index";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CollectionType, PlayPreviewType } from "~/utils/types";
import StandardPopover from "../standard-popover";

type ExpandedPlayProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  setCommentCount: (count: number) => void;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
};

const ExpandedPlay = ({ play, setCommentCount }: ExpandedPlayProps) => {
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
    if (affIds) {
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
    void fetchCollections();
  }, []);

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
      <div className="flex w-full items-center justify-start">
        <IconButton
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          size="small"
        >
          <LibraryBooksIcon color="action" />
          <StandardPopover
            content="Play Collections"
            handlePopoverClose={handlePopoverClose}
            open={open}
            anchorEl={anchorEl}
          />
        </IconButton>
        {collections?.map((col) => (
          <Button key={col.id} size="small" onClick={() => handleClick(col.id)}>
            /{col.title}
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
