import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PublicIcon from "@mui/icons-material/Public";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import {
  clearIntervalAsync,
  setIntervalAsync,
  type SetIntervalAsyncTimer,
} from "set-interval-async";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import TeamLogo from "~/components/teams/team-logo";
import StandardPopover from "~/components/utils/standard-popover";
import type { PlaySearchOptions } from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import ExpandedPlay from "../expanded-play";
import PlayActionsMenu from "../play-actions-menu";
import PlayMentions from "../play-mentions";
import PlayTags from "../play-tags";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayPreviewType;
  scrollToPlayer: () => void;
  activePlay?: PlayPreviewType;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
};

const Play = ({
  play,
  player,
  scrollToPlayer,
  activePlay,
  setActivePlay,
  searchOptions,
  setSearchOptions,
}: PlayProps) => {
  const { user } = useAuthContext();
  const { isDark, hoverText, backgroundStyle } = useIsDarkContext();
  const { isMobile } = useMobileContext();

  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [seenActivePlay, setSeenActivePlay] = useState<boolean>(false);

  const interval = useRef<SetIntervalAsyncTimer<[]> | null>(null);

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null });

  const exclusiveTeam = play.team;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: 1 | 2,
  ) => {
    if (target === 1) {
      setAnchorEl({ anchor1: e.currentTarget, anchor2: null, anchor3: null });
    } else if (target === 2) {
      setAnchorEl({ anchor1: null, anchor2: e.currentTarget, anchor3: null });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null });
  };

  const open = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);

  const updateLastWatched = async (time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({
          last_watched: play.video.id,
          last_watched_time: time,
        })
        .eq("id", user.userId);
    } else return;
  };

  const handleClick = async () => {
    scrollToPlayer();
    setSeenActivePlay(false);
    setActivePlay(play);
    void player?.seekTo(play.play.start_time, true);
    void player?.playVideo();
    void updateLastWatched(play.play.start_time);
  };

  const getCurrentTime = async (player: YouTubePlayer) => {
    return Math.round(await player.getCurrentTime());
  };

  const checkTime = async () => {
    if (player && activePlay) {
      void getCurrentTime(player).then((currentTime) => {
        const endTime = play.play.end_time;
        if (currentTime == endTime && interval.current && !seenActivePlay) {
          void player.pauseVideo();
          void clearIntervalAsync(interval.current);
          interval.current = null;
          setSeenActivePlay(true);
        } else if (currentTime !== endTime && !interval.current) {
          interval.current = setIntervalAsync(
            async () => void checkTime(),
            1000,
          );
        } else if (currentTime == endTime && seenActivePlay) {
          void player.seekTo(play.play.start_time, true);
          void player.pauseVideo();
          if (interval.current) {
            void clearIntervalAsync(interval.current);
            interval.current = null;
          }
        }
        return;
      });
    } else return;
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

  useEffect(() => {
    void checkTime();
  }, [activePlay, seenActivePlay]);

  useEffect(() => {
    if (interval.current) {
      void clearIntervalAsync(interval.current);
      interval.current = null;
    }
  }, []);

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-sm p-2 ${
        isDark ? `odd:bg-grey-900` : `odd:bg-grey-100`
      }`}
      style={activePlay && backgroundStyle}
    >
      <div className="flex cursor-pointer flex-col gap-1" onClick={handleClick}>
        <div className="flex items-center justify-between font-bold">
          <div className="flex items-center gap-1">
            {play.play.highlight && (
              <div
                className="flex items-center justify-center"
                onClick={(e) => handleHighlightClick(e)}
                onMouseEnter={(e) => handlePopoverOpen(e, 2)}
                onMouseLeave={handlePopoverClose}
              >
                <StarIcon color="secondary" />
                <StandardPopover
                  content="Highlight"
                  handlePopoverClose={handlePopoverClose}
                  open={open2}
                  anchorEl={anchorEl.anchor2}
                />
              </div>
            )}
            <div
              className="flex cursor-pointer items-center"
              onMouseEnter={(e) => handlePopoverOpen(e, 1)}
              onMouseLeave={handlePopoverClose}
              onClick={(e) => e.stopPropagation()}
            >
              {play.team ? (
                <IconButton size="small" onClick={(e) => handlePrivateClick(e)}>
                  <TeamLogo size={25} tm={play.team} inactive={true} />
                </IconButton>
              ) : (
                <PublicIcon />
              )}
              <StandardPopover
                content={
                  play.team
                    ? `Play is private to ${play.team.full_name}`
                    : "Public Play"
                }
                handlePopoverClose={handlePopoverClose}
                open={open}
                anchorEl={anchorEl.anchor1}
              />
            </div>
            <Divider orientation="vertical" flexItem />
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
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {activePlay && (
              <IconButton size="small" onClick={handleClick}>
                <RestartAltIcon color="primary" />
              </IconButton>
            )}
            <PlayActionsMenu preview={play} />
          </div>
        </div>
        <span>
          <strong
            className={hoverText}
            onClick={() => void router.push(`/profile/${play.play.author_id}`)}
          >
            {play.play.author_name}:
          </strong>{" "}
          {play.play.title}
        </span>
        <div
          className={
            !isMobile
              ? "flex items-center gap-1"
              : "flex flex-col justify-center gap-1"
          }
        >
          <PlayMentions
            activePlay={activePlay}
            play={play}
            handleMentionAndTagClick={handleMentionAndTagClick}
          />
          <PlayTags
            activePlay={activePlay}
            play={play}
            handleMentionAndTagClick={handleMentionAndTagClick}
          />
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
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
              <KeyboardArrowUpIcon color="primary" />
            </IconButton>
          ) : (
            <IconButton size="small" onClick={() => setIsExpanded(true)}>
              <KeyboardArrowDownIcon color="primary" />
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

export default Play;
