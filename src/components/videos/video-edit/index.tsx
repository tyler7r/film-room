import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"; // Added forwardRef, useImperativeHandle
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

// Define props for EditVideo
type EditVideoProps = {
  video: VideoType;
  isOpen: boolean; // Controlled by parent
  setIsOpen: (open: boolean) => void; // Controlled by parent
};

// Define an interface for the ref handle (optional, but good practice)
export interface EditVideoRef {
  openModal: () => void;
}

const EditVideo = forwardRef<EditVideoRef, EditVideoProps>(
  ({ video, isOpen, setIsOpen }, ref) => {
    // Accept ref here
    const { user, affiliations } = useAuthContext();

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

    // Expose openModal function through ref
    useImperativeHandle(ref, () => ({
      openModal: () => {
        setIsOpen(true);
      },
    }));

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
      setVideoData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleDivision = (e: SelectChangeEvent) => {
      const div = e.target.value;
      setVideoData((prev) => ({ ...prev, division: div }));
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
        }));
      } else {
        const isCoachVideo = getRoleByTeamId(affiliations, status);
        const addPrivateTeamToMentions = findPrivatedTeam(teams, status);
        // Only add if not already present to avoid duplicates
        if (
          addPrivateTeamToMentions &&
          !teamMentions.find((tm) => tm.id === addPrivateTeamToMentions.id)
        ) {
          setTeamMentions((prev) => [...prev, addPrivateTeamToMentions]);
        }
        if (isCoachVideo === "coach") {
          setVideoData((prev) => ({
            ...prev,
            private: true,
            exclusive_to: status,
            coach_video: true,
          }));
        } else {
          setVideoData((prev) => ({
            ...prev,
            private: true,
            exclusive_to: status,
            coach_video: false,
          }));
        }
      }
    };

    const handleWeek = (e: SelectChangeEvent) => {
      const week = e.target.value;
      setVideoData((prev) => ({ ...prev, week: week }));
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
      setMessage({ status: "error", text: undefined }); // Clear message on reset
    };

    const updateErrorMessage = () => {
      const { link, title, season, division } = videoData;
      const isValidLink = isValidYoutubeLink(link);
      const isUnedited = checkForUnEdited();

      if (title === "") {
        setMessage({ status: "error", text: "Please enter a valid title!" });
      } else if (link === "" || !isValidLink) {
        setMessage({
          status: "error",
          text: "Please enter a valid YouTube video link!",
        });
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
      }
    };

    const checkForUnEdited = () => {
      const week = videoData.week === "" ? null : videoData.week;
      const tournament =
        videoData.tournament === "" ? null : videoData.tournament;
      const exclusive =
        videoData.exclusive_to === "public" ? null : videoData.exclusive_to;

      // Sort team mentions arrays for reliable comparison
      const currentTeamMentionsIds = teamMentions.map((m) => m.id).sort();
      const initialTeamMentionsIds = initialTeamMentions
        .map((m) => m.id)
        .sort();

      return (
        videoData.division === video.division &&
        exclusive === (video.exclusive_to ?? null) && // Handle null/undefined exclusive_to
        videoData.private === video.private &&
        videoData.season === video.season &&
        videoData.title === video.title &&
        tournament === (video.tournament ?? null) && // Handle null/undefined tournament
        week === (video.week ?? null) && // Handle null/undefined week
        JSON.stringify(currentTeamMentionsIds) ===
          JSON.stringify(initialTeamMentionsIds)
      );
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
    }, [videoData, teamMentions, initialTeamMentions, video]); // Add video to dependencies for checkForUnEdited

    const handleTeamMention = async (teamId: string, videoId: string) => {
      // Check if the team is already linked to the video to prevent duplicates
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
        // Only insert if no existing link is found
        const { error } = await supabase
          .from("team_videos")
          .insert({
            team_id: teamId,
            video_id: videoId,
          })
          .select();
        if (error) {
          console.error("Error linking team to video:", error);
        }
      }
    };

    const handleDeleteTeamVideo = async (teamId: string) => {
      const { error } = await supabase
        .from("team_videos")
        .delete()
        .match({
          team_id: teamId,
          video_id: video.id,
        })
        .select();
      if (error) {
        console.error("Error deleting team video link:", error);
      }
    };

    const handleUpdateTeamMentions = async () => {
      // Teams removed from mentions
      const removedTeams = initialTeamMentions.filter(
        (initialTeam) =>
          !teamMentions.some(
            (currentTeam) => currentTeam.id === initialTeam.id,
          ),
      );

      // Teams newly added to mentions
      const addedTeams = teamMentions.filter(
        (currentTeam) =>
          !initialTeamMentions.some(
            (initialTeam) => initialTeam.id === currentTeam.id,
          ),
      );

      await Promise.all(removedTeams.map((tm) => handleDeleteTeamVideo(tm.id)));
      await Promise.all(
        addedTeams.map((tm) => handleTeamMention(tm.id, video.id)),
      );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      updateErrorMessage(); // Update message first
      if (!isValidForm) {
        return; // Prevent submission if form is not valid
      }

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
            keywords: `${title} ${season} ${week === "" ? "" : week} ${
              tournament === "" ? "" : tournament
            } ${division}`, // Ensure keywords are clean (no 'null' strings)
            duplicate_check: videoData.private
              ? `${videoData.exclusive_to}`
              : videoData.link, // Duplicate check based on privacy
            uploaded_at: video.uploaded_at, // Preserve original upload date
          })
          .eq("id", video.id)
          .select()
          .single();
        if (data) {
          await handleUpdateTeamMentions(); // Await all team mention updates
          reset();
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
      void fetchTaggedTeams();
      void fetchTeams();
    }, [video.id]); // Fetch on video ID change

    return (
      <ModalSkeleton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleClose={reset}
        title="Edit Video"
      >
        <Box
          component="form" // Use Box as a form element
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
              width: { xs: "100%", sm: "80%" }, // Responsive width for content
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2, // Equivalent to gap-4
              p: 2, // Equivalent to p-2
            }}
          >
            <TextField
              sx={{ width: "100%" }} // Equivalent to w-full
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
            <Box
              sx={{
                display: "flex",
                width: "100%", // Equivalent to w-full
                gap: 2, // Equivalent to gap-4
                flexDirection: { xs: "column", sm: "row" }, // Stack on mobile, row on larger screens
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
                sx={{ width: "100%" }} // Equivalent to w-full
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
                sx={{ width: "100%" }} // Equivalent to w-full
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
            <FormControl
              sx={{ width: "100%", display: "flex" }} // Combined w-full and gap-2
            >
              <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%", // Equivalent to w-full
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

export default EditVideo;
