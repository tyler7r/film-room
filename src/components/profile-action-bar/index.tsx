import CreateIcon from "@mui/icons-material/Create";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarIcon from "@mui/icons-material/Star";
import { IconButton } from "@mui/material";
import { useMobileContext } from "~/contexts/mobile";
import type { ProfileActionBarType } from "~/utils/types";
import PageTitle from "../page-title";

type ProfileActionBarProps = {
  actionBarStatus: ProfileActionBarType;
  setActionBarStatus: (status: ProfileActionBarType) => void;
};

const ProfileActionBar = ({
  actionBarStatus,
  setActionBarStatus,
}: ProfileActionBarProps) => {
  const { isMobile } = useMobileContext();

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
    <div
      className={`mt-2 flex ${
        isMobile ? "w-full justify-center gap-4" : "w-4/5 justify-around"
      }`}
    >
      <div
        onClick={() => handleModalToggle("createdPlays")}
        className="flex cursor-pointer flex-col items-center justify-center gap-1"
      >
        <IconButton
          size="small"
          color={actionBarStatus.createdPlays ? "primary" : "default"}
        >
          <CreateIcon sx={{ fontSize: "42px" }} />
        </IconButton>
        <PageTitle
          title="created"
          size="small"
          purple={actionBarStatus.createdPlays ? true : false}
        />
      </div>
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-1"
        onClick={() => handleModalToggle("mentions")}
      >
        <IconButton
          size="small"
          color={actionBarStatus.mentions ? "primary" : "default"}
        >
          <LocalOfferIcon sx={{ fontSize: "42px" }} />
        </IconButton>
        <PageTitle
          title="mentions"
          size="small"
          purple={actionBarStatus.mentions ? true : false}
        />
      </div>
      <div
        onClick={() => handleModalToggle("highlights")}
        className="flex cursor-pointer flex-col items-center justify-center gap-1"
      >
        <IconButton
          size="small"
          color={actionBarStatus.highlights ? "primary" : "default"}
        >
          <StarIcon sx={{ fontSize: "42px" }} />
        </IconButton>
        <PageTitle
          title="highlights"
          size="small"
          purple={actionBarStatus.highlights ? true : false}
        />
      </div>
    </div>
  );
};

export default ProfileActionBar;
