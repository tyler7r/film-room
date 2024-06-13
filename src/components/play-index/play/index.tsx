import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import AddComment from "~/components/interactions/comments/add-comment";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import CommentIndex from "~/components/interactions/comments/comment-index";
import LikeBtn from "~/components/interactions/likes/like-btn";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MentionType, PlayType, TagType } from "~/utils/types";
import type { PlaySearchOptions } from "..";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayType;
  scrollToPlayer: () => void;
  activePlay?: PlayType | null;
  setActivePlay: (play: PlayType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
  videoId: string;
};

const Play = ({
  player,
  play,
  scrollToPlayer,
  setActivePlay,
  activePlay,
  searchOptions,
  setSearchOptions,
  setIsFiltersOpen,
  videoId,
}: PlayProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const { user } = useAuthContext();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [tags, setTags] = useState<TagType[] | null>(null);

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("play->>id", play.id);
    if (data && data.length > 0) {
      const mentions: MentionType[] = data.map((mention) => mention.mention);
      setMentions(mentions);
    } else setMentions(null);
  };

  const fetchTags = async () => {
    const tags = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("play->>id", play.id);
    if (user.currentAffiliation?.team.id) {
      void tags.or(
        `tag->>private.eq.false, tag->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void tags.eq("play->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  };

  const updateLastWatched = async (time: number) => {
    await supabase
      .from("profiles")
      .update({
        last_watched: videoId,
        last_watched_time: time,
      })
      .eq("id", `${user.userId}`);
  };

  const handleClick = async (playTime: number, play: PlayType) => {
    scrollToPlayer();
    void player?.seekTo(playTime, true);
    void updateLastWatched(playTime);
    setActivePlay(play);
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

  useEffect(() => {
    void fetchMentions();
    void fetchTags();
  }, []);

  return (
    <div className="flex w-full grow flex-col self-center">
      <div
        style={backgroundStyle}
        className="flex cursor-pointer items-center gap-2 rounded-md p-4"
        onClick={() => handleClick(play.start_time, play)}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="w-min text-center text-xl font-bold tracking-tight">
            {play.author_name}
          </div>
          <div className="flex gap-1">
            <LikeBtn
              playId={play.id}
              includePopover={true}
              activePlay={activePlay}
            />
            <CommentBtn
              isOpen={isExpanded}
              setIsOpen={setIsExpanded}
              commentCount={commentCount}
              setCommentCount={setCommentCount}
              playId={play.id}
              activePlay={activePlay}
            />
          </div>
        </div>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ marginRight: "8px", marginLeft: "8px" }}
        />
        <div className="mr-2 flex flex-col items-center justify-center gap-2">
          {play.highlight && <StarIcon color="secondary" fontSize="large" />}
          {play.private && <LockIcon fontSize="large" color="action" />}
        </div>
        <div className="flex grow flex-col items-center">
          <div className="text-center text-xl tracking-wide md:text-2xl">
            {play.title}
          </div>
          {mentions && (
            <div className="flex w-full flex-col">
              <Divider flexItem sx={{ margin: "8px", marginBottom: "12px" }} />
              <div className="flex flex-grow flex-wrap items-center justify-center gap-3">
                {mentions.map((m) => (
                  <div
                    className={`text-center text-sm font-bold even:text-slate-500 md:text-base ${hoverText}`}
                    key={m.receiver_name}
                    onClick={(e) => handleMentionClick(e, m.receiver_name)}
                  >
                    {m.receiver_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Typography variant="body2" fontWeight="bold">
            {play.start_time < 3600
              ? new Date(play.start_time * 1000).toISOString().substring(14, 19)
              : new Date(play.start_time * 1000)
                  .toISOString()
                  .substring(11, 19)}
          </Typography>
          <Typography variant="caption">
            {play.end_time - play.start_time}s
          </Typography>
        </div>
        <div
          className="self-center"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <Button startIcon={<ExpandLessIcon fontSize="large" />}>
              Close
            </Button>
          ) : (
            <Button startIcon={<ExpandMoreIcon fontSize="large" />}>
              Open
            </Button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-col gap-1 self-start p-2 pl-4 pr-4 text-xl">
            <div>
              <strong className="tracking-tight">Description: </strong>
              {play.note}
            </div>
            <div className="flex flex-wrap">
              {tags?.map((tag) => (
                <Button
                  key={tag.title}
                  onClick={() => handleTagClick(tag.title)}
                >
                  #{tag.title}
                </Button>
              ))}
            </div>
          </div>
          <AddComment playId={play.id} />
          <CommentIndex
            playId={play.id}
            setCommentCount={setCommentCount}
            isActivePlay={activePlay?.id === play.id ? true : false}
          />
        </div>
      )}
    </div>
  );
};

export default Play;
