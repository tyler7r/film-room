// components/videos/create-video/index.tsx (REFINED)

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  standaloneTrigger?: boolean;
};

export interface CreateVideoRef {
  openModal: () => void;
}

const CreateVideo = forwardRef<CreateVideoRef, CreateVideoProps>(
  ({ isOpen, setIsOpen, standaloneTrigger = false }, ref) => {
    const router = useRouter();
    const { user } = useAuthContext();
    const { affiliations } = useAuthContext();

    // Internal state for modal if not externally controlled
    const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);

    // Determine the active isOpen state and setter
    const activeIsOpen = isOpen ?? internalIsOpen;
    const setActiveIsOpen = setIsOpen ?? setInternalIsOpen;

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

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setActiveIsOpen(true);
      },
    }));

    const handleOpenModalTrigger = () => {
      if (user.isLoggedIn) {
        setActiveIsOpen(true);
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
      setVideoData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleDivision = (e: SelectChangeEvent) => {
      const div = e.target.value;
      setVideoData((prev) => ({ ...prev, division: div }));
    };

    const handleWeek = (e: SelectChangeEvent) => {
      const week = e.target.value;
      setVideoData((prev) => ({ ...prev, week: week }));
    };

    const getRoleByTeamId = (
      affs: TeamAffiliationType[] | null,
      id: string,
    ) => {
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
        setVideoData((prev) => ({
          ...prev,
          private: false,
          exclusive_to: "public",
          coach_video: false,
        }));
        setTeamMentions((prev) =>
          prev.filter((tm) => tm.id !== videoData.exclusive_to),
        );
      } else {
        const isCoachVideo = getRoleByTeamId(affiliations, status);
        const addPrivateTeamToMentions = findPrivatedTeam(teams, status);
        if (
          addPrivateTeamToMentions &&
          !teamMentions.some((tm) => tm.id === addPrivateTeamToMentions.id)
        ) {
          setTeamMentions((prev) => [...prev, addPrivateTeamToMentions]);
        }
        setVideoData((prev) => ({
          ...prev,
          private: true,
          exclusive_to: status,
          coach_video: isCoachVideo === "coach",
        }));
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
      setActiveIsOpen(false);
      setMessage({ status: "error", text: undefined });
    };

    const updateErrorMessage = () => {
      const { link, title, season, division } = videoData;
      const isValidLink = isValidYoutubeLink(link);
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
        setIsValidForm(false);
      } else if (season === "") {
        setMessage({
          status: "error",
          text: "Please enter a valid season/year!",
        });
        setIsValidForm(false);
      } else {
        setMessage({ status: "error", text: undefined });
        setIsValidForm(true);
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

    const handleTeamMention = async (teamId: string, videoId: string) => {
      const { data: existingLink, error: existingLinkError } = await supabase
        .from("team_videos")
        .select("id")
        .match({ team_id: teamId, video_id: videoId })
        .maybeSingle();

      if (existingLinkError) {
        console.error(
          "Error checking existing team video link:",
          existingLinkError,
        );
        return;
      }

      if (!existingLink) {
        const { error } = await supabase.from("team_videos").insert({
          team_id: teamId,
          video_id: videoId,
        });
        if (error) {
          console.error("Error linking team to video:", error);
        }
      }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      updateErrorMessage();
      if (!isValidForm) {
        return;
      }

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
            week: week === "" ? null : week,
            tournament: tournament === "" ? null : tournament,
            coach_video: videoData.coach_video,
            private: videoData.private,
            exclusive_to: videoData.private ? videoData.exclusive_to : null,
            author_id: user.userId,
            keywords: `${title} ${season} ${week === "" ? "" : week} ${
              tournament === "" ? "" : tournament
            } ${division}`,
            duplicate_check: videoData.private
              ? `${videoData.exclusive_to}`
              : updatedLink,
          })
          .select()
          .single();
        if (data) {
          await Promise.all(
            teamMentions.map((mention) =>
              handleTeamMention(mention.id, data.id),
            ),
          );

          reset();
          void router.push(`/film-room/${data.id}`);
        }
        if (error) {
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
      }
    };

    useEffect(() => {
      void fetchTeams();
    }, []);

    // Render nothing if the modal is not open AND it's not a standalone trigger
    if (!activeIsOpen && !standaloneTrigger) {
      return null;
    }

    // Render the standalone button if it's a standaloneTrigger AND the modal is not open
    if (standaloneTrigger && !activeIsOpen) {
      return (
        <Button
          type="button"
          endIcon={<AddIcon />}
          onClick={handleOpenModalTrigger}
          variant="contained"
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            borderRadius: "8px",
            fontWeight: "bold",
            minWidth: "auto",
            boxShadow: 2,
            letterSpacing: "0.025em",
          }}
        >
          Add New Video
        </Button>
      );
    }

    // Otherwise, render the ModalSkeleton (meaning activeIsOpen is true)
    return (
      <ModalSkeleton
        title="Add Video"
        isOpen={activeIsOpen}
        setIsOpen={setActiveIsOpen}
        handleClose={reset}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", sm: "80%" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              p: 2,
            }}
          >
            <TextField
              sx={{ width: "100%" }}
              name="title"
              autoComplete="title"
              required
              id="title"
              label="Video Title"
              onChange={handleInput}
              value={videoData.title}
              multiline
              size="small"
            />
            <TextField
              sx={{ width: "100%" }}
              name="link"
              autoComplete="link"
              required
              id="link"
              label="Video Link"
              onChange={handleInput}
              value={videoData.link}
              size="small"
            />
            <Box
              sx={{
                display: "flex",
                width: "100%",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <FormControl sx={{ width: "100%" }} required>
                <InputLabel htmlFor="divisions">Division</InputLabel>
                <Select
                  value={videoData.division}
                  onChange={handleDivision}
                  label="Division"
                  required
                  name="divisions"
                  id="divisions"
                  size="small"
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
                sx={{ width: "100%" }}
                name="season"
                autoComplete="season"
                id="season"
                label="Season/Year"
                required
                onChange={handleInput}
                value={videoData.season}
                size="small"
              />
            </Box>
            {proDivs.includes(videoData.division) ? (
              <FormControl sx={{ width: "100%" }}>
                <InputLabel htmlFor="weeks">Week</InputLabel>
                <Select
                  value={videoData.week}
                  onChange={handleWeek}
                  label="Week"
                  name="weeks"
                  id="weeks"
                  size="small"
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
                sx={{ width: "100%" }}
                name="tournament"
                autoComplete="tournament"
                id="tournament"
                label="Tournament (if applicable)"
                onChange={handleInput}
                value={videoData.tournament}
                size="small"
              />
            )}
            <TeamMentions
              mentions={teamMentions}
              setMentions={setTeamMentions}
              teams={teams}
            />
            <FormControl sx={{ width: "100%", display: "flex" }}>
              <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Select
                  value={videoData.exclusive_to}
                  onChange={handlePrivacyStatus}
                  label="Privacy Status"
                  name="privacy"
                  id="privacy-status"
                  size="small"
                  sx={{ width: "100%" }}
                >
                  <MenuItem value="public" sx={{ fontSize: "14px" }}>
                    Public
                  </MenuItem>
                  {affiliations?.map((aff) => (
                    <MenuItem key={aff.team.id} value={aff.team.id}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography variant="body2">
                          Private to:{" "}
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: "bold",
                              letterSpacing: "-0.025em",
                            }}
                          >
                            {aff.team.full_name}
                          </Typography>
                        </Typography>
                        <TeamLogo tm={aff.team} size={25} />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize={"10px"}
                  px={1}
                  py={0.25}
                  sx={{ letterSpacing: "0.025em" }}
                >
                  Private videos are only viewable by teammates and coaches
                  (regardless of if an opponent team is mentioned). Public
                  videos are viewable by all users.
                </Typography>
              </Box>
            </FormControl>
          </Box>
          <FormMessage message={message} />
          <FormButtons
            submitTitle="SUBMIT"
            handleCancel={reset}
            isValid={isValidForm}
          />
        </Box>
      </ModalSkeleton>
    );
  },
);

CreateVideo.displayName = "CreateVideo";

export default CreateVideo;
