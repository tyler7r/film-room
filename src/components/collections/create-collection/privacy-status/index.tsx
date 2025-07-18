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
import type { NewCollectionType } from "~/utils/types";

type PrivacyStatusProps = {
  newDetails: NewCollectionType;
  setNewDetails: (newDetails: NewCollectionType) => void;
};

const PrivacyStatus = ({ newDetails, setNewDetails }: PrivacyStatusProps) => {
  const { affiliations } = useAuthContext();

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setNewDetails({ ...newDetails, private: false, exclusive_to: "public" });
    } else {
      setNewDetails({ ...newDetails, private: true, exclusive_to: status });
    }
  };

  return (
    <FormControl
      sx={{ display: "flex", gap: "8px", width: "100%", textAlign: "start" }}
    >
      <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
      <div className="flex w-full flex-col items-center justify-center">
        <Select
          value={newDetails.exclusive_to ?? "public"}
          onChange={handlePrivacyStatus}
          label="Privacy Status"
          name="privacy"
          id="privacy-status"
          className="w-full"
          size="small"
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
        <Typography
          variant="caption"
          color="text.secondary"
          fontSize={"10px"}
          px={1}
          py={0.25}
          sx={{ letterSpacing: "0.025em" }}
        >
          Private collections are only viewable by teammates and coaches. Public
          collections are viewable by all users.
        </Typography>
      </div>
    </FormControl>
  );
};

export default PrivacyStatus;
