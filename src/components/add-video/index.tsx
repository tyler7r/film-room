import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { isValidYoutubeLink } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { MessageType, VideoUploadType } from "~/utils/types";
import FormMessage from "../form-message";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

const AddVideo = () => {
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
    exclusive_to: "",
    week: "",
    season: "",
    tournament: "",
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
      private: false,
      exclusive_to: "",
      week: "",
      season: "",
      tournament: "",
    });
    setIsOpen(false);
  };

  useEffect(() => {
    // Update form validity and form message as necessary
    const { link, title, season } = videoData;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const isVideoDuplicated = await checkIfDuplicateVideo(e);
    e.preventDefault();
    const { title, link, season, week, tournament } = videoData;
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
      reset();
    }
  };

  return isOpen ? (
    <Modal open={isOpen} onClose={reset}>
      <Box
        sx={style}
        className="relative flex w-4/5 flex-col items-center justify-center rounded-md p-4"
      >
        <Button
          variant="text"
          size="large"
          className="absolute right-0 top-0 text-2xl font-bold"
          onClick={reset}
        >
          X
        </Button>
        {/* <Typography className="text-3xl font-bold tracking-wider">
          Add a Video
        </Typography> */}
        <Divider flexItem variant="middle" className="m-2 mx-16">
          <Typography className="text-3xl font-bold tracking-wider">
            Add a Video
          </Typography>
        </Divider>
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
              label="Season/Year"
              required
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
                Keep this video private to{" "}
                {`${user.currentAffiliation?.team.city} ${user.currentAffiliation?.team.name}`}{" "}
              </div>
              <Checkbox
                checked={videoData.private}
                onChange={() => {
                  setVideoData({ ...videoData, private: !videoData.private });
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
              Add Video
            </Button>
            <Button type="button" onClick={reset} size="large">
              Cancel
            </Button>
          </div>
        </form>
        {/* <Divider flexItem variant="middle" className="mb-4"></Divider> */}
      </Box>
    </Modal>
  ) : (
    <Button
      className="mb-3 text-lg"
      type="button"
      size="large"
      endIcon={<AddIcon />}
      onClick={() => setIsOpen(true)}
    >
      Add New Video
    </Button>
  );
};

export default AddVideo;
