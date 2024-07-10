import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { divisions, isValidYoutubeLink, proDivs } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MessageType, TeamType, VideoUploadType } from "~/utils/types";
import FormMessage from "../form-message";
import PageTitle from "../page-title";
import TeamLogo from "../team-logo";
import TeamMentions from "../team-mentions";

const AddVideo = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
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
  });
  const [teamMentions, setTeamMentions] = useState<TeamType[] | null>(null);
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

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setVideoData({ ...videoData, private: false, exclusive_to: "public" });
    } else {
      setVideoData({ ...videoData, private: true, exclusive_to: status });
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
    });
    setTeamMentions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    // Update form validity and form message as necessary
    const { link, title, season, division } = videoData;
    const isValidLink = isValidYoutubeLink(link);

    if (title === "") {
      setMessage({
        status: "error",
        text: "Please enter a valid video title!",
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
  }, [videoData]);

  const handleTeamMention = async (teamId: string, video: string) => {
    await supabase.from("team_videos").insert({
      team_id: teamId,
      video_id: video,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, link, season, week, tournament, division } = videoData;
    if (user.userId) {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          title,
          link,
          season,
          division,
          week: week === "" ? null : `Week ${week}`,
          tournament: tournament === "" ? null : tournament,
          private: videoData.private,
          exclusive_to: videoData.private ? videoData.exclusive_to : null,
          author_id: user.userId,
          keywords: `${title} ${season} ${
            week === "" ? null : `Week ${week}`
          } ${tournament === "" ? null : tournament} ${division}`,
        })
        .select()
        .single();
      if (data && teamMentions) {
        teamMentions.forEach((mention) => {
          void handleTeamMention(mention.id, data.id);
        });
        void reset();
      }
      if (error)
        setMessage({
          text: `A ${
            videoData.private ? "private" : "public"
          } video with this link has already been published.`,
          status: "error",
        });
    }
  };

  useEffect(() => {
    void fetchTeams();
  }, []);

  return isOpen ? (
    <Modal open={isOpen} onClose={reset}>
      <Box
        className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid p-4"
        sx={backgroundStyle}
      >
        <Button
          variant="text"
          size="large"
          sx={{
            position: "absolute",
            top: "0",
            right: "0",
            fontSize: "1.5rem",
            lineHeight: "2rem",
            fontWeight: "bold",
          }}
          onClick={reset}
        >
          X
        </Button>
        <PageTitle title="Add a Video" size="medium" />
        <form
          onSubmit={handleSubmit}
          className="flex w-4/5 flex-col items-center justify-center gap-4 p-4 text-center"
        >
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
            <TextField
              className="w-full"
              name="week"
              autoComplete="week"
              id="week"
              label="Week #  (if applicable)"
              onChange={handleInput}
              value={videoData.week}
            />
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
                <MenuItem value="public">Public</MenuItem>
                {affiliations?.map((div) => (
                  <MenuItem key={div.team.id} value={div.team.id}>
                    <div className="flex gap-2">
                      <div>
                        Private to: <strong>{div.team.full_name}</strong>
                      </div>
                      {div.team.logo && <TeamLogo tm={div.team} size={25} />}
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
          <FormMessage message={message} />
          <div className="flex gap-2">
            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={!isValidForm}
            >
              Add Video
            </Button>
            <Button type="button" onClick={reset} size="large">
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  ) : (
    <Button
      sx={{ marginBottom: "12px", fontSize: "18px", lineHeight: "28px" }}
      type="button"
      size="large"
      endIcon={<AddIcon />}
      onClick={handleOpen}
    >
      Add New Video
    </Button>
  );
};

export default AddVideo;
