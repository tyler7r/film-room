import { Button } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import TeamPageButton from "../team-profile-btn";

type MainMenuProps = {
  size: "small" | "medium" | "large";
};

const MainMenu = ({ size }: MainMenuProps) => {
  const { backgroundStyle } = useIsDarkContext();
  return (
    <div style={backgroundStyle} className={`flex items-center justify-around`}>
      <Button variant="text" size={size}>
        Film Room
      </Button>
      <Button variant="text" size={size}>
        Highlight Factory
      </Button>
      <TeamPageButton />
      <Button variant="text" size={size}>
        Inbox
      </Button>
    </div>
  );
};

export default MainMenu;
