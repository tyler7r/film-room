import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import type { NewPlayType, TeamType, VideoType } from "~/utils/types";

type PrivacyStatusProps = {
  video: VideoType;
  newDetails: NewPlayType;
  setNewDetails: (newDetails: NewPlayType) => void;
};

const PrivacyStatus = ({
  video,
  newDetails,
  setNewDetails,
}: PrivacyStatusProps) => {
  const { affiliations } = useAuthContext();
  const exclusiveTeam: TeamType | null =
    affiliations?.find((aff) => aff.team.id === video.exclusive_to)?.team ??
    null;

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setNewDetails({ ...newDetails, private: false, exclusive_to: "public" });
    } else {
      setNewDetails({ ...newDetails, private: true, exclusive_to: status });
    }
  };

  return (
    <FormControl className="w-full text-start" sx={{ display: "flex" }}>
      <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
      <div className="flex w-full flex-col items-center justify-center gap-2">
        {video.private && video.exclusive_to && (
          <Select
            value={newDetails.exclusive_to}
            onChange={handlePrivacyStatus}
            label="Privacy Status"
            name="privacy"
            id="privacy-status"
            className="w-full"
            size="small"
          >
            <MenuItem value={video.exclusive_to}>
              <div className="flex gap-2">
                <div className="text-sm">
                  Private to:{" "}
                  <strong className="tracking-tight">
                    {exclusiveTeam?.full_name}
                  </strong>
                </div>
                {exclusiveTeam && <TeamLogo tm={exclusiveTeam} size={25} />}
              </div>
            </MenuItem>
          </Select>
        )}
        {!video.private && (
          <Select
            value={newDetails.exclusive_to}
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
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          fontSize={"10px"}
          px={1}
          py={0.25}
          sx={{ letterSpacing: "0.025em" }}
        >
          {video.private
            ? `Since this is a private video, all plays are also private to just members of your team.`
            : "Private plays are only viewable by your teammates and coaches, even on public videos. Public plays are viewable by all users."}
        </Typography>
        {/* <Tooltip
          title={
            video.private
              ? `Since this is a private video, all plays are also private to just members of your team.`
              : "Private plays are only viewable by your teammates and coaches, even on public videos. Public plays are viewable by all users."
          }
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
        </Tooltip> */}
      </div>
    </FormControl>
  );
};

export default PrivacyStatus;
