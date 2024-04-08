import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import TeamPageButton from "../team-profile-btn";

type MainMenuProps = {
  size: "small" | "medium" | "large";
};

const MainMenu = ({ size }: MainMenuProps) => {
  const router = useRouter();
  const { backgroundStyle } = useIsDarkContext();
  const { isOpen, setIsOpen } = useInboxContext();

  return (
    <div style={backgroundStyle} className="flex items-center justify-around">
      <Button
        variant="text"
        size={size}
        onClick={() => router.push("/film-room")}
        sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
      >
        Film Room
      </Button>
      <Button
        variant="text"
        size={size}
        sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
      >
        Highlight Factory
      </Button>
      <TeamPageButton />
      <Button
        sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
        variant="text"
        size={size}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        Inbox
      </Button>
    </div>
  );
};

export default MainMenu;
