import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import DeleteMenu from "~/components/delete-menu";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import PlayActionsMenu from "~/components/play-actions-menu";
import StandardPopover from "~/components/standard-popover";
import Tags from "~/components/tags";
import TeamLogo from "~/components/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TeamType } from "~/utils/types";
import type { PlaySearchOptions } from "..";
import ExpandedPlay from "../../expanded-play";
import Mentions from "../../mentions";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayPreviewType;
  scrollToPlayer: () => void;
  activePlay?: PlayPreviewType;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
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
  videoId,
}: PlayProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
  });

  const exclusiveTeam: TeamType | undefined = affiliations?.find(
    (aff) => aff.team.id === play.play.exclusive_to,
  )?.team;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: "a" | "b",
  ) => {
    if (target === "a") {
      setAnchorEl({ ...anchorEl, anchor1: e.currentTarget });
    } else {
      setAnchorEl({ ...anchorEl, anchor2: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null });
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);

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

  const handleMentionAndTagClick = (e: React.MouseEvent, topic: string) => {
    e.stopPropagation();
    setSearchOptions({ ...searchOptions, topic: topic });
  };

  const handleHighlightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchOptions({
      ...searchOptions,
      only_highlights: !searchOptions.only_highlights,
    });
  };

  const handlePrivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchOptions({
      ...searchOptions,
      private_only: exclusiveTeam?.id ? exclusiveTeam.id : "all",
    });
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from("plays").delete().eq("id", play.play.id);
  };

  return (
    <div className={`flex w-full flex-col gap-4`}>
      <div className="grid gap-1 rounded-md p-2 px-4" style={backgroundStyle}>
        <div
          className="flex cursor-pointer flex-col gap-1"
          onClick={() => handleClick(play.play.start_time, play)}
        >
          <div className="flex w-full items-center justify-center gap-4">
            <div className="flex items-center justify-center gap-2">
              {play.play.private && exclusiveTeam && (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => handlePrivateClick(e)}
                  onMouseEnter={(e) => handlePopoverOpen(e, "b")}
                  onMouseLeave={handlePopoverClose}
                >
                  <TeamLogo tm={exclusiveTeam} size={30} inactive={true} />
                  <StandardPopover
                    open={open2}
                    anchorEl={anchorEl.anchor2}
                    content={`Play is private to ${exclusiveTeam?.full_name}`}
                    handlePopoverClose={handlePopoverClose}
                  />
                </div>
              )}
            </div>
            <div className="flex w-full items-center justify-center gap-2">
              <div className="flex items-center text-sm tracking-tight text-slate-600">
                {convertTimestamp(play.play.created_at)}
              </div>
              <Divider flexItem orientation="vertical" variant="fullWidth" />
              <div className="flex items-center justify-center gap-1 text-center font-bold">
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
              {activePlay && (
                <div
                  className="flex cursor-pointer items-center"
                  onMouseEnter={(e) => handlePopoverOpen(e, "a")}
                  onMouseLeave={handlePopoverClose}
                  onClick={() => handleRestartClick(play.play.start_time)}
                >
                  <RestartAltIcon color="primary" fontSize="large" />
                  <StandardPopover
                    content="Restart Play"
                    open={open1}
                    anchorEl={anchorEl.anchor1}
                    handlePopoverClose={handlePopoverClose}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-1">
              {play.play.highlight && (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => handleHighlightClick(e)}
                >
                  <StarIcon color="secondary" fontSize="large" />
                </div>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <PlayActionsMenu preview={play} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <div
                className={`font-serif text-xl font-bold italic tracking-tighter ${hoverText}`}
                onClick={() =>
                  void router.push(`/profile/${play.play.author_id}`)
                }
              >
                {play.play.author_name}
              </div>
              <Divider flexItem orientation="vertical" variant="middle" />
              <div>{play.play.title}</div>
            </div>
            <div className="flex justify-center">
              <Mentions
                activePlay={activePlay}
                play={play}
                handleMentionAndTagClick={handleMentionAndTagClick}
              />
            </div>
            <div className="flex items-center justify-center">
              <Tags
                activePlay={activePlay}
                handleMentionAndTagClick={handleMentionAndTagClick}
                play={play}
              />
            </div>
          </div>
        </div>
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
          {play.play.author_id === user.userId && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteMenu
                isOpen={isDeleteMenuOpen}
                setIsOpen={setIsDeleteMenuOpen}
                handleDelete={handleDelete}
              />
            </div>
          )}
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
      {isExpanded && (
        <ExpandedPlay
          play={play}
          handleMentionAndTagClick={handleMentionAndTagClick}
          setCommentCount={setCommentCount}
        />
      )}
    </div>
  );
};

export default IndexPlay;
