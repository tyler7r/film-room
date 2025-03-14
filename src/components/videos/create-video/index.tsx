import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/router";
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
  youtubeRegEx,
} from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type {
  MessageType,
  TeamAffiliationType,
  TeamType,
  VideoUploadType,
} from "~/utils/types";

type CreateVideoProps = {
  listItem?: boolean;
};

const CreateVideo = ({ listItem }: CreateVideoProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { affiliations } = useAuthContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [videoData, setVideoData] = useState<VideoUploadType>({
    link: "",
    title: "",
    private: false,
    exclusive_to: "public",
    week: "",
    season: "",
    tournament: "",
    division: "",
    coach_video: false,
  });
  const [teamMentions, setTeamMentions] = useState<TeamType[]>([]);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const handleOpen = () => {
    if (user.isLoggedIn) {
      setIsOpen(true);
    } else {
      void router.push("/login");
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

  const handleWeek = (e: SelectChangeEvent) => {
    const week = e.target.value;
    setVideoData({ ...videoData, week: week });
  };

  const getRoleByTeamId = (affs: TeamAffiliationType[] | null, id: string) => {
    const found = affs?.find((item) => item.team.id === id);
    console.log(found);
    return found ? found.role : null;
  };

  const findPrivatedTeam = (arr: TeamType[] | null, id: string) => {
    const team = arr?.find((item) => item.id === id);
    return team ? team : null;
  };

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setVideoData({
        ...videoData,
        private: false,
        exclusive_to: "public",
        coach_video: false,
      });
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

  const reset = () => {
    setVideoData({
      link: "",
      title: "",
      private: false,
      exclusive_to: "public",
      week: "",
      season: "",
      tournament: "",
      division: "",
      coach_video: false,
    });
    setTeamMentions([]);
    setIsOpen(false);
  };

  const updateErrorMessage = () => {
    const { link, title, season, division } = videoData;
    const isValidLink = isValidYoutubeLink(link);
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
      } else {
        setMessage({ status: "error", text: undefined });
        setIsValidForm(true);
      }
    }
  };

  useEffect(() => {
    const { link, title, season, division } = videoData;
    const isValidLink = isValidYoutubeLink(link);

    if (
      title === "" ||
      season === "" ||
      link === "" ||
      !isValidLink ||
      division === ""
    ) {
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [videoData]);

  const handleTeamMention = async (teamId: string, video: string) => {
    await supabase.from("team_videos").insert({
      team_id: teamId,
      video_id: video,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateErrorMessage();
    const { title, link, season, week, tournament, division } = videoData;
    const updatedLink = youtubeRegEx(link);
    if (user.userId) {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          title,
          link: updatedLink,
          season,
          division,
          week: week === "" ? null : `${week}`,
          tournament: tournament === "" ? null : tournament,
          coach_video: videoData.coach_video,
          private: videoData.private,
          exclusive_to: videoData.private ? videoData.exclusive_to : null,
          author_id: user.userId,
          keywords: `${title} ${season} ${
            week === "" ? null : `Week ${week}`
          } ${tournament === "" ? null : tournament} ${division}`,
          duplicate_check: videoData.private ? `${videoData.exclusive_to}` : "",
        })
        .select()
        .single();
      if (data) {
        teamMentions.forEach((mention) => {
          void handleTeamMention(mention.id, data.id);
        });
        setVideoData({
          link: "",
          title: "",
          private: false,
          exclusive_to: "public",
          week: "",
          season: "",
          tournament: "",
          division: "",
          coach_video: false,
        });
        setTeamMentions([]);
        setIsOpen(false);
        void router.push(`/film-room/${data.id}`);
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
    void fetchTeams();
  }, []);

  return isOpen ? (
    <ModalSkeleton
      title="Add Video"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleClose={reset}
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
          <TextField
            className="w-full"
            name="link"
            autoComplete="link"
            required
            id="link"
            label="Video Link"
            onChange={handleInput}
            value={videoData.link}
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
                <MenuItem value="">No Week</MenuItem>
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
            <FormControl className="w-full">
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
  ) : !listItem ? (
    <Button
      type="button"
      endIcon={<AddIcon />}
      onClick={handleOpen}
      variant="contained"
      sx={{ fontWeight: "bold" }}
    >
      Add New Video
    </Button>
  ) : (
    <div onClick={handleOpen} className="text-sm font-bold">
      NEW VIDEO
    </div>
  );
};

export default CreateVideo;
