import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { divisions, isValidYoutubeLink, proDivs } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type {
  MessageType,
  TeamMentionType,
  VideoUploadType,
} from "~/utils/types";
import FormMessage from "../form-message";
import PageTitle from "../page-title";
import TeamMentions from "../team-mentions";

const AddVideo = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [videoData, setVideoData] = useState<VideoUploadType>({
    link: "",
    title: "",
    private: false,
    exclusive_to: "",
    week: "",
    season: "",
    tournament: "",
    division: "",
  });
  const [teamMentions, setTeamMentions] = useState<string[]>([]);
  const [teams, setTeams] = useState<TeamMentionType | null>(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const handleOpen = () => {
    if (user.isLoggedIn) {
      setIsOpen(true);
    } else {
      void router.push("/login");
    }
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("full_name, id");
    if (data) setTeams(data);
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

  const reset = () => {
    setVideoData({
      link: "",
      title: "",
      private: false,
      exclusive_to: "",
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

  const checkIfDuplicateVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await supabase
      .from("videos")
      .select()
      .match(
        videoData.private
          ? {
              link: videoData.link,
              exclusive_to: user.currentAffiliation?.team.id,
              private: videoData.private,
            }
          : { link: videoData.link, private: videoData.private },
      )
      .single();
    if (data) return true;
    else return false;
  };

  const handleTeamMention = async (teamId: string, video: string) => {
    await supabase.from("team_videos").insert({
      team_id: teamId,
      video_id: video,
      exclusive_to: videoData.private ? user.currentAffiliation?.team.id : null,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const isVideoDuplicated = await checkIfDuplicateVideo(e);
    e.preventDefault();
    const { title, link, season, week, tournament, division } = videoData;
    if (isVideoDuplicated) {
      setMessage({
        status: "error",
        text: `This ${
          videoData.private ? "private" : "public"
        } video already exists!`,
      });
      setIsValidForm(false);
      return;
    }
    const { data } = await supabase
      .from("videos")
      .insert({
        title,
        link,
        season,
        division,
        week: week === "" ? null : week,
        tournament: tournament === "" ? null : tournament,
        private: videoData.private,
        exclusive_to: videoData.private
          ? user.currentAffiliation?.team.id
          : null,
      })
      .select()
      .single();
    if (data) {
      teamMentions.forEach((mention) => {
        const team = teams?.find((t) => t.full_name === mention);
        if (team) {
          void handleTeamMention(team.id, data.id);
        }
      });
      void reset();
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
              <InputLabel>Division</InputLabel>
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
              label="Week  (if applicable)"
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
          {user.currentAffiliation?.team.id && (
            <div className="flex items-center justify-center">
              <div className="text-xl font-bold tracking-tight">
                Keep this video private to{" "}
                {`${user.currentAffiliation?.team.full_name} `}
              </div>
              <Checkbox
                checked={videoData.private}
                onChange={() => {
                  setVideoData({ ...videoData, private: !videoData.private });
                }}
                size="medium"
                name="private-only"
                id="private-only"
              />
            </div>
          )}
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
