import CreateIcon from "@mui/icons-material/Create";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarIcon from "@mui/icons-material/Star";
import { IconButton } from "@mui/material";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import type { ProfileActionBarType } from "~/utils/types";

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
      className={`mt-8 flex ${
        isMobile ? "w-full justify-center gap-4" : "w-4/5 justify-around"
      }`}
    >
      <div
        onClick={() => handleModalToggle("createdPlays")}
        className={`flex cursor-pointer items-center justify-center`}
      >
        <IconButton
          size="small"
          color={actionBarStatus.createdPlays ? "primary" : "default"}
        >
          <CreateIcon fontSize="large" />
        </IconButton>
        <PageTitle
          title="created"
          size="small"
          purple={actionBarStatus.createdPlays ? true : false}
        />
      </div>
      <div
        className="flex cursor-pointer items-center justify-center"
        onClick={() => handleModalToggle("mentions")}
      >
        <IconButton
          size="small"
          color={actionBarStatus.mentions ? "primary" : "default"}
        >
          <LocalOfferIcon fontSize="large" />
        </IconButton>
        <PageTitle
          title="mentions"
          size="small"
          purple={actionBarStatus.mentions ? true : false}
        />
      </div>
      <div
        onClick={() => handleModalToggle("highlights")}
        className="flex cursor-pointer items-center justify-center gap-1"
      >
        <IconButton
          size="small"
          color={actionBarStatus.highlights ? "primary" : "default"}
        >
          <StarIcon fontSize="large" />
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
