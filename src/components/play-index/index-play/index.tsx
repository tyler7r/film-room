import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LockIcon from "@mui/icons-material/Lock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import DeleteMenu from "~/components/delete-menu";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import CommentIndex from "~/components/interactions/comments/comment-index";
import LikeBtn from "~/components/interactions/likes/like-btn";
import StandardPopover from "~/components/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MentionType, PlayPreviewType, TagType } from "~/utils/types";
import type { PlaySearchOptions } from "..";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayPreviewType;
  scrollToPlayer: () => void;
  activePlay?: PlayPreviewType;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
  videoId: string;
};

const IndexPlay = ({
  activePlay,
  player,
  play,
  scrollToPlayer,
  setActivePlay,
  searchOptions,
  setSearchOptions,
  setIsFiltersOpen,
  videoId,
}: PlayProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [tags, setTags] = useState<TagType[] | null>(null);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("play->>id", play.play.id);
    if (data && data.length > 0) {
      const mentions: MentionType[] = data.map((mention) => mention.mention);
      setMentions(mentions);
    } else setMentions(null);
  };

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

  const updateLastWatched = async (time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({
          last_watched: videoId,
          last_watched_time: time,
        })
        .eq("id", user.userId);
    } else return;
  };

  const handleClick = async (playTime: number, play: PlayPreviewType) => {
    scrollToPlayer();
    void player?.seekTo(playTime, true);
    void player?.playVideo();
    const duration = (play.play.end_time + 1 - play.play.start_time) * 1000;
    setTimeout(() => {
      void player?.pauseVideo();
    }, duration);
    void updateLastWatched(playTime);
    setActivePlay(play);
  };

  const handleRestartClick = async (playTime: number) => {
    void player?.seekTo(playTime, true);
    void player?.playVideo();
    const duration = (play.play.end_time + 1 - play.play.start_time) * 1000;
    setTimeout(() => {
      void player?.pauseVideo();
    }, duration);
  };

  const handleMentionClick = (e: React.MouseEvent, mention: string) => {
    e.stopPropagation();
    setIsFiltersOpen(true);
    setSearchOptions({ ...searchOptions, topic: mention });
  };

  const handleTagClick = (tag: string) => {
    setIsFiltersOpen(true);
    setSearchOptions({ ...searchOptions, topic: tag });
  };

  const handleHighlightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFiltersOpen(true);
    setSearchOptions({
      ...searchOptions,
      only_highlights: !searchOptions.only_highlights,
    });
  };

  const handlePrivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFiltersOpen(true);
    setSearchOptions({
      ...searchOptions,
      private_only: !searchOptions.private_only,
    });
  };

  const convertTimestamp = (date: string) => {
    const month =
      date.slice(5, 6) === "0" ? date.slice(6, 7) : date.substring(5, 7);
    const day =
      date.slice(8, 9) === "0" ? date.slice(9, 10) : date.substring(8, 10);
    return `${month}/${day}`;
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from("plays").delete().eq("id", play.play.id);
  };

  useEffect(() => {
    void fetchMentions();
    void fetchTags();
  }, [activePlay]);

  return (
    <div className={`flex w-full flex-col gap-4`}>
      <div className="grid gap-1 rounded-md p-2" style={backgroundStyle}>
        <div
          className="flex cursor-pointer flex-col gap-2"
          onClick={() => handleClick(play.play.start_time, play)}
        >
          <div className="flex w-full items-center justify-center gap-4">
            <div className="flex items-center gap-1 text-lg font-bold">
              {play.play.start_time < 3600
                ? new Date(play.play.start_time * 1000)
                    .toISOString()
                    .substring(14, 19)
                : new Date(play.play.start_time * 1000)
                    .toISOString()
                    .substring(11, 19)}
              <span className="text-sm font-light">
                ({play.play.end_time - play.play.start_time}s)
              </span>
            </div>
            <div className="mr-2 flex items-center justify-center gap-2">
              {play.play.highlight && (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => handleHighlightClick(e)}
                >
                  <StarIcon color="secondary" fontSize="large" />
                </div>
              )}
              {play.play.private && (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => handlePrivateClick(e)}
                >
                  <LockIcon fontSize="large" color="action" />
                </div>
              )}
            </div>
            {activePlay && (
              <>
                <div
                  className="flex cursor-pointer items-center"
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  onClick={() => handleRestartClick(play.play.start_time)}
                >
                  <RestartAltIcon color="primary" fontSize="large" />
                </div>
                <StandardPopover
                  content="Restart Play"
                  open={open}
                  anchorEl={anchorEl}
                  handlePopoverClose={handlePopoverClose}
                />
              </>
            )}
            {play.play.author_id === user.userId && (
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteMenu
                  isOpen={isDeleteMenuOpen}
                  setIsOpen={setIsDeleteMenuOpen}
                  handleDelete={handleDelete}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="mr-2 text-sm tracking-tight text-slate-600">
              {convertTimestamp(play.play.created_at)}
            </div>
            <div
              className={`tracking text-center text-2xl font-bold ${hoverText}`}
              onClick={() =>
                void router.push(`/profile/${play.play.author_id}`)
              }
            >
              {play.play.author_name}
            </div>
            <Divider flexItem orientation="vertical" variant="middle" />
            <div>{play.play.title}</div>
          </div>
          {mentions && (
            <div className="flex items-center justify-center gap-2">
              <LocalOfferIcon />
              {mentions?.map((mention) => (
                <div
                  onClick={(e) => handleMentionClick(e, mention.receiver_name)}
                  className={`tracking text-center font-bold ${hoverText}`}
                  key={mention.id}
                >
                  @{mention.receiver_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-center gap-3 px-1">
          <div className="flex items-center justify-center gap-2">
            <LikeBtn playId={play.play.id} />
            <CommentBtn
              isOpen={isExpanded}
              setIsOpen={setIsExpanded}
              playId={play.play.id}
              commentCount={commentCount}
              setCommentCount={setCommentCount}
              activePlay={null}
            />
            {isExpanded ? (
              <IconButton size="small" onClick={() => setIsExpanded(false)}>
                <KeyboardArrowUpIcon color="primary" fontSize="large" />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={() => setIsExpanded(true)}>
                <KeyboardArrowDownIcon color="primary" fontSize="large" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="flex w-full flex-col items-center gap-2 px-8">
          <div className="w-full">
            <strong
              onClick={() =>
                void router.push(`/profile/${play.play.author_id}`)
              }
              className={hoverText}
            >
              Note:{" "}
            </strong>
            {play.play.note}
          </div>
          <div className="flex w-full gap-2">
            {tags?.map((tag) => (
              <Button
                key={tag.title + tag.id}
                size="small"
                onClick={() => handleTagClick(tag.title)}
              >
                #{tag.title}
              </Button>
            ))}
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <AddComment playId={play.play.id} />
            <CommentIndex
              playId={play.play.id}
              setCommentCount={setCommentCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPlay;
