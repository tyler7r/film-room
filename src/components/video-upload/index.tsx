import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Checkbox,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { isValidYoutubeLink } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { MessageType, VideoUploadType } from "~/utils/types";
import FormMessage from "../form-message";

const VideoUpload = () => {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [videoData, setVideoData] = useState<VideoUploadType>({
    link: "",
    title: "",
    private: false,
    exclusive_to: null,
    week: null,
    season: null,
    tournament: null,
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVideoData({
      ...videoData,
      [name]: value,
    });
  };

  const reset = () => {
    setVideoData({
      link: "",
      title: "",
      private: true,
      exclusive_to: null,
      week: null,
      season: null,
      tournament: null,
    });
    setIsOpen(false);
  };

  useEffect(() => {
    // Update form validity and form message as necessary
    const { link, title } = videoData;
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
        text: "Please enter a valid video link!",
      });
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [videoData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, link, season, week, tournament } = videoData;
    const { data } = await supabase
      .from("videos")
      .insert({
        title,
        link,
        season,
        week,
        tournament,
        private: videoData.private,
        exclusive_to: `${
          videoData.private ? user.currentAffiliation?.team.id : null
        }`,
      })
      .single();
    if (data) console.log(data);
  };

  return isOpen ? (
    <div className="flex w-full flex-col items-center justify-center">
      <Typography className="text-3xl font-bold tracking-wider">
        Upload a Video
      </Typography>
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
        <div className="flex gap-4">
          <TextField
            className="w-full"
            name="season"
            autoComplete="season"
            id="season"
            label="Season (if applicable)"
            onChange={handleInput}
            value={videoData.season}
          />
          <TextField
            className="w-full"
            name="week"
            autoComplete="week"
            id="week"
            label="Week  (if applicable)"
            onChange={handleInput}
            value={videoData.week}
          />
        </div>
        <TextField
          className="w-full"
          name="tournament"
          autoComplete="tournament"
          id="tournament"
          label="Tournament  (if applicable)"
          onChange={handleInput}
          value={videoData.tournament}
        />
        {user.currentAffiliation?.team.id && (
          <div className="flex items-center justify-center">
            <div className="text-xl font-bold tracking-tight">
              Keep this video private for:{" "}
              {`${user.currentAffiliation?.team.city} ${user.currentAffiliation?.team.name}`}
            </div>
            <Checkbox
              checked={videoData.private}
              onChange={() => {
                setVideoData({ ...videoData, private: !videoData.private });
                console.log(videoData);
              }}
              size="medium"
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
            Upload Video
          </Button>
          <Button type="button" onClick={reset} size="large">
            Cancel
          </Button>
        </div>
      </form>
      <Divider flexItem variant="middle" className="mb-4"></Divider>
    </div>
  ) : (
    <Button
      className="mb-3 text-lg"
      type="button"
      size="large"
      endIcon={<AddIcon />}
      onClick={() => setIsOpen(true)}
    >
      Upload New Video
    </Button>
  );
};

export default VideoUpload;
