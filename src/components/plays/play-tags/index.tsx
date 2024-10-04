import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { IconButton } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TagType } from "~/utils/types";
import StandardPopover from "../../utils/standard-popover";

type PlayTagProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
};

const PlayTags = ({
  play,
  activePlay,
  handleMentionAndTagClick,
}: PlayTagProps) => {
  const { affIds } = useAuthContext();
  const { colorText, isDark } = useIsDarkContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tags, setTags] = useState<TagType[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchTags = async () => {
    const tags = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("play->>id", play.play.id);
    if (affIds && affIds.length > 0) {
      void tags.or(`tag->>private.eq.false, tag->>exclusive_to.in.(${affIds})`);
    } else {
      void tags.eq("tag->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  };

  const handleTagClick = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("topic", term);
    } else {
      params.delete("topic");
    }
    void router.push(`/search/tags?${params.toString()}`);
  };

  const handleClick = (e: React.MouseEvent, tag: string) => {
    if (handleMentionAndTagClick) handleMentionAndTagClick(e, tag);
    else handleTagClick(tag);
  };

  useEffect(() => {
    const channel = supabase
      .channel("tag_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchTags();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchTags();
  }, [activePlay, play]);

  return (
    tags &&
    tags.length > 0 && (
      <div className="flex flex-wrap items-center">
        <IconButton
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          size="small"
        >
          <LocalOfferIcon fontSize="small" color="action" />
        </IconButton>
        <StandardPopover
          handlePopoverClose={handlePopoverClose}
          open={open}
          content="Play Tags"
          anchorEl={anchorEl}
        />
        <div className="flex gap-1">
          {tags.map((tag) => (
            <div
              key={tag.title + tag.id}
              onClick={(e) => handleClick(e, tag.title)}
              className={`${colorText} cursor-pointer text-xs font-bold ${
                isDark ? "hover:text-purple-300" : "hover:text-purple-A200"
              }`}
            >
              #{tag.title.toLocaleUpperCase()}
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default PlayTags;
