import CreateIcon from "@mui/icons-material/Create";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarIcon from "@mui/icons-material/Star";
import { IconButton } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { ProfileActionBarType } from "~/utils/types";

type ProfileActionBarProps = {
  actionBarStatus: ProfileActionBarType;
  setActionBarStatus: (status: ProfileActionBarType) => void;
};

const ProfileActionBar = ({
  actionBarStatus,
  setActionBarStatus,
}: ProfileActionBarProps) => {
  const { backgroundStyle } = useIsDarkContext();

  const handleModalToggle = (modal: string) => {
    if (modal === "createdPlays") {
      setActionBarStatus({
        createdPlays: true,
        mentions: false,
        highlights: false,
      });
    } else if (modal === "mentions") {
      setActionBarStatus({
        createdPlays: false,
        mentions: true,
        highlights: false,
      });
    } else {
      setActionBarStatus({
        createdPlays: false,
        mentions: false,
        highlights: true,
      });
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-3/5 justify-around">
        <IconButton
          size="large"
          onClick={() => handleModalToggle("createdPlays")}
          color={actionBarStatus.createdPlays ? "primary" : "default"}
        >
          <CreateIcon sx={{ fontSize: "48px" }} />
        </IconButton>
        <IconButton
          size="large"
          onClick={() => handleModalToggle("mentions")}
          color={actionBarStatus.mentions ? "primary" : "default"}
        >
          <LocalOfferIcon sx={{ fontSize: "48px" }} />
        </IconButton>
        <IconButton
          size="large"
          onClick={() => handleModalToggle("highlights")}
          color={actionBarStatus.highlights ? "primary" : "default"}
        >
          <StarIcon sx={{ fontSize: "48px" }} />
        </IconButton>
      </div>
    </div>
  );
};

export default ProfileActionBar;
