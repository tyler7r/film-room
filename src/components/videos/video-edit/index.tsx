import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import TeamMentions from "~/components/teams/team-mentions";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import {
  divisions,
  isValidYoutubeLink,
  proDivs,
  proDivWeeks,
} from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type {
  MessageType,
  TeamAffiliationType,
  TeamType,
  VideoType,
  VideoUploadType,
} from "~/utils/types";

type EditVideoProps = {
  video: VideoType;
};

const EditVideo = ({ video }: EditVideoProps) => {
  const { user } = useAuthContext();
  const { affiliations } = useAuthContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [videoData, setVideoData] = useState<VideoUploadType>({
    link: video.link,
    title: video.title,
    private: video.private,
    exclusive_to: video.exclusive_to ?? "public",
    week: video.week ?? "",
    season: video.season ?? "",
    tournament: video.tournament ?? "",
    division: video.division,
    coach_video: video.coach_video,
  });
  const [initialTeamMentions, setInitialTeamMentions] = useState<TeamType[]>(
    [],
  );
  const [teamMentions, setTeamMentions] = useState<TeamType[]>([]);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const fetchTaggedTeams = async () => {
    const { data } = await supabase
      .from("team_video_view")
      .select()
      .eq("video->>id", video.id);
    if (data && data.length > 0) {
      setInitialTeamMentions(data.map((d) => d.team));
      setTeamMentions(data.map((d) => d.team));
    } else {
      setTeamMentions([]);
      setInitialTeamMentions([]);
    }
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select();
    if (data && data.length > 0) setTeams(data);
    else setTeams(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVideoData({
      ...videoData,
      [name]: value,
    });
  };

  const handleDivision = (e: SelectChangeEvent) => {
    const div = e.target.value;
    setVideoData({ ...videoData, division: div });
  };

  const getRoleByTeamId = (affs: TeamAffiliationType[] | null, id: string) => {
    const found = affs?.find((item) => item.team.id === id);
    return found ? found.role : null;
  };

  const findPrivatedTeam = (arr: TeamType[] | null, id: string) => {
    const team = arr?.find((item) => item.id === id);
    return team ? team : null;
  };

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setVideoData({ ...videoData, private: false, exclusive_to: "public" });
    } else {
      const isCoachVideo = getRoleByTeamId(affiliations, status);
      const addPrivateTeamToMentions = findPrivatedTeam(teams, status);
      if (addPrivateTeamToMentions) {
        setTeamMentions((prev) => [...prev, addPrivateTeamToMentions]);
      }
      if (isCoachVideo === "coach") {
        setVideoData({
          ...videoData,
          private: true,
          exclusive_to: status,
          coach_video: true,
        });
      } else {
        setVideoData({
          ...videoData,
          private: true,
          exclusive_to: status,
          coach_video: false,
        });
      }
    }
  };

  const handleWeek = (e: SelectChangeEvent) => {
    const week = e.target.value;
    setVideoData({ ...videoData, week: week });
  };

  const reset = () => {
    setVideoData({
      link: video.link,
      title: video.title,
      private: video.private,
      exclusive_to: video.exclusive_to ?? "public",
      week: video.week ?? "",
      season: video.season ?? "",
      tournament: video.tournament ?? "",
      division: video.division,
      coach_video: video.coach_video,
    });
    setIsOpen(false);
    setTeamMentions(initialTeamMentions);
  };

  const updateErrorMessage = () => {
    const { link, title, season, division } = videoData;
    const isValidLink = isValidYoutubeLink(link);
    const isUnedited = checkForUnEdited();
    if (!isValidForm) {
      if (title === "") {
        setMessage({
          status: "error",
          text: "Please enter a valid title!",
        });
        setIsValidForm(false);
      } else if (link === "" || !isValidLink) {
        setMessage({
          status: "error",
          text: "Please enter a valid YouTube video link!",
        });
        setIsValidForm(false);
      } else if (division === "") {
        setMessage({
          status: "error",
          text: "Please select a valid division!",
        });
      } else if (season === "") {
        setMessage({
          status: "error",
          text: "Please enter a valid season/year!",
        });
      } else if (isUnedited) {
        setMessage({
          status: "error",
          text: "Please make a change in order to submit the video's edit!",
        });
      } else {
        setMessage({ status: "error", text: undefined });
        setIsValidForm(true);
      }
    }
  };

  const checkForUnEdited = () => {
    const week = videoData.week === "" ? null : videoData.week;
    const tournament =
      videoData.tournament === "" ? null : videoData.tournament;
    const exclusive =
      videoData.exclusive_to === "public" ? null : videoData.exclusive_to;
    if (
      videoData.division === video.division &&
      exclusive === video.exclusive_to &&
      videoData.private === video.private &&
      videoData.season === video.season &&
      videoData.title === video.title &&
      tournament === video.tournament &&
      week === video.week &&
      JSON.stringify(teamMentions.map((m) => m.id)) ===
        JSON.stringify(initialTeamMentions.map((m) => m.id))
    ) {
      return true;
    } else return false;
  };

  useEffect(() => {
    const { link, title, season, division } = videoData;
    const isValidLink = isValidYoutubeLink(link);
    const isUnedited = checkForUnEdited();

    if (
      title === "" ||
      season === "" ||
      link === "" ||
      !isValidLink ||
      division === "" ||
      isUnedited
    ) {
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [videoData, teamMentions]);

  const handleTeamMention = async (teamId: string, videoId: string) => {
    await supabase
      .from("team_videos")
      .insert({
        team_id: teamId,
        video_id: videoId,
      })
      .select();
  };

  const handleDeleteTeamVideo = async (teamId: string) => {
    await supabase
      .from("team_videos")
      .delete()
      .match({
        team_id: teamId,
        video_id: video.id,
      })
      .select();
  };

  const handleRemoveTeamMentions = () => {
    initialTeamMentions.forEach((tm1) => {
      const isIncluded = teamMentions.find((tm2) => tm2.id === tm1.id);
      if (!isIncluded) {
        void handleDeleteTeamVideo(tm1.id);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateErrorMessage();
    const { title, link, season, week, tournament, division } = videoData;
    if (user.userId) {
      const { data, error } = await supabase
        .from("videos")
        .update({
          title,
          link,
          season,
          division,
          week: week === "" ? null : week,
          tournament: tournament === "" ? null : tournament,
          private: videoData.private,
          exclusive_to: videoData.private ? videoData.exclusive_to : null,
          author_id: user.userId,
          coach_video: videoData.coach_video,
          keywords: `${title} ${season} ${week === "" ? null : week} ${
            tournament === "" ? null : tournament
          } ${division}`,
          duplicate_check: videoData.private ? `${videoData.exclusive_to}` : "",
          uploaded_at: video.uploaded_at,
        })
        .eq("id", video.id)
        .select()
        .single();
      if (data) {
        handleRemoveTeamMentions();
        teamMentions.forEach((mention) => {
          void handleTeamMention(mention.id, video.id);
        });
        void reset();
      }
      if (error)
        if (error.code === "23505") {
          setMessage({
            text: `A ${
              videoData.private ? "private" : "public"
            } video with this link has already been published.`,
            status: "error",
          });
        } else {
          setMessage({
            text: `There was a problem publishing this video: ${error.message}`,
            status: "error",
          });
        }
    }
  };

  useEffect(() => {
    void fetchTaggedTeams();
    void fetchTeams();
  }, []);

  return isOpen ? (
    <ModalSkeleton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleClose={reset}
      title="Edit Video"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center justify-center gap-2"
      >
        <div className="flex w-4/5 flex-col items-center justify-center gap-4 p-2 text-center">
          <TextField
            className="w-full"
            name="title"
            autoComplete="title"
            required
            id="title"
            label="Video Title"
            onChange={handleInput}
            value={videoData.title}
          />
          <div className="flex w-full gap-4 text-start">
            <FormControl className="w-full" required>
              <InputLabel htmlFor="divisions">Division</InputLabel>
              <Select
                value={videoData.division}
                onChange={handleDivision}
                label="Division"
                required
                name="divisions"
                id="divisions"
              >
                <MenuItem value="">No Division</MenuItem>
                {divisions.map((div) => (
                  <MenuItem key={div} value={div}>
                    {div}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              className="w-full"
              name="season"
              autoComplete="season"
              id="season"
              label="Season/Year"
              required
              onChange={handleInput}
              value={videoData.season}
            />
          </div>
          {proDivs.includes(videoData.division) ? (
            <FormControl className="w-full text-start">
              <InputLabel htmlFor="divisions">Week</InputLabel>
              <Select
                value={videoData.week}
                onChange={handleWeek}
                label="Week"
                name="weeks"
                id="weeks"
              >
                <MenuItem value="">No Week</MenuItem>
                {proDivWeeks.map((div) => (
                  <MenuItem key={div} value={div}>
                    {div}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              className="w-full"
              name="tournament"
              autoComplete="tournament"
              id="tournament"
              label="Tournament  (if applicable)"
              onChange={handleInput}
              value={videoData.tournament}
            />
          )}
          <TeamMentions
            mentions={teamMentions}
            setMentions={setTeamMentions}
            teams={teams}
          />
          <FormControl
            className="w-full text-start"
            sx={{ display: "flex", gap: "8px" }}
          >
            <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
            <div className="flex w-full items-center justify-center gap-2">
              <Select
                value={videoData.exclusive_to}
                onChange={handlePrivacyStatus}
                label="Privacy Status"
                name="privacy"
                id="privacy-status"
                className="w-full"
              >
                <MenuItem value="public" style={{ fontSize: "14px" }}>
                  Public
                </MenuItem>
                {affiliations?.map((div) => (
                  <MenuItem key={div.team.id} value={div.team.id}>
                    <div className="flex gap-2">
                      <div className="text-sm">
                        Private to:{" "}
                        <strong className="tracking-tight">
                          {div.team.full_name}
                        </strong>
                      </div>
                      <TeamLogo tm={div.team} size={25} />
                    </div>
                  </MenuItem>
                ))}
              </Select>
              <Tooltip
                title="Private videos are only viewable by teammates and coaches (regardless of if an opponent team is tagged above). Public videos are viewable by all users."
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
              >
                <IconButton size="small">
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </FormControl>
        </div>
        <FormMessage message={message} />
        <FormButtons
          submitTitle="SUBMIT"
          handleCancel={reset}
          isValid={isValidForm}
        />
      </form>
    </ModalSkeleton>
  ) : (
    <div
      className="text-sm font-bold tracking-tight"
      onClick={() => setIsOpen(true)}
    >
      EDIT VIDEO
    </div>
  );
};

export default EditVideo;
