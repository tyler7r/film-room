import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
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
      className="mt-8 w-full text-start"
      sx={{ display: "flex", gap: "8px" }}
    >
      <InputLabel htmlFor="privacy-status">Privacy Status</InputLabel>
      <div className="flex w-full items-center justify-center gap-2">
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
            <MenuItem
              key={div.team.id}
              value={div.team.id}
              sx={{
                display: "flex",
                alignItems: "center",
                // 🎯 FIX: Compressed menu item padding
                p: 1,
                pl: 2,
                minHeight: "auto",
                gap: 0.5,
              }}
            >
              <Typography variant="caption">Plays private to: </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1,
                  letterSpacing: -0.25,
                }}
              >
                {div.team.full_name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
        <Tooltip
          title={
            "Private collections are only viewable by your teammates and coaches. Public collections are viewable by all users."
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
        </Tooltip>
      </div>
    </FormControl>
  );
};

export default PrivacyStatus;
