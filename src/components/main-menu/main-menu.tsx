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
        className="lg:text-xl"
      >
        Film Room
      </Button>
      <Button variant="text" size={size} className="lg:text-xl">
        Highlight Factory
      </Button>
      <TeamPageButton />
      <Button
        className="lg:text-xl"
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
