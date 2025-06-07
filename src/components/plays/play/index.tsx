import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import type { YouTubePlayer } from "react-youtube";
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
  setSeenActivePlay: (seenActivePlay: boolean) => void;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
};

const Play = ({
  play,
  player,
  scrollToPlayer,
  activePlay,
  setActivePlay,
  searchOptions,
  setSearchOptions,
  setSeenActivePlay,
  setIsFiltersOpen,
}: PlayProps) => {
  const { user } = useAuthContext();
  const { isDark, hoverText, backgroundStyle } = useIsDarkContext();
  const { isMobile } = useMobileContext();

  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null });

  const exclusiveTeam = play.team;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: 1 | 2 | 3,
  ) => {
    if (target === 1) {
      setAnchorEl({ anchor1: e.currentTarget, anchor2: null, anchor3: null });
    } else if (target === 2) {
      setAnchorEl({ anchor1: null, anchor2: e.currentTarget, anchor3: null });
    } else {
      setAnchorEl({ anchor1: null, anchor2: null, anchor3: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null });
  };

  const open = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);

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

  const handleMentionAndTagClick = (e: React.MouseEvent, topic: string) => {
    e.stopPropagation();
    setIsFiltersOpen(true);
    setSearchOptions({ ...searchOptions, topic: topic });
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
      private_only: exclusiveTeam?.id ? exclusiveTeam.id : "all",
    });
  };

  const handlePlayClick = () => {
    const playId = play.play.id;
    void router.push(`/play/${playId}`);
  };

  const copyToClipboard = () => {
    const origin = window.location.origin;
    void navigator.clipboard.writeText(`${origin}/play/${play.play.id}`);
    setIsCopied(true);
  };

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-sm p-2 ${
        isDark ? `odd:bg-grey-800` : `odd:bg-grey-100`
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
            <IconButton
              onClick={copyToClipboard}
              onMouseEnter={(e) => handlePopoverOpen(e, 3)}
              onMouseLeave={handlePopoverClose}
              size="small"
            >
              <LinkIcon />
              <StandardPopover
                open={open3}
                anchorEl={anchorEl.anchor3}
                content={isCopied ? "Copied!" : `Copy play link`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
            <PlayActionsMenu
              preview={play}
              onCopyLink={copyToClipboard}
              onPlayClick={handlePlayClick}
            />
          </div>
        </div>
        <span>
          <strong
            className={`${hoverText} tracking-tight`}
            onClick={() => void router.push(`/profile/${play.play.author_id}`)}
          >
            {play.author.name}:
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
          ) : play.play.note ? (
            <Button
              size="small"
              style={{ fontWeight: "bold" }}
              variant="text"
              onClick={() => setIsExpanded(true)}
              endIcon={
                <KeyboardArrowDownIcon color="primary" fontSize="large" />
              }
            >
              See note
            </Button>
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

export default Play;
