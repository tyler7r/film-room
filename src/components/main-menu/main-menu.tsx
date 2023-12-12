import { Button, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";

type MainMenuProps = {
  size: "small" | "medium" | "large";
};

const MainMenu = ({ size }: MainMenuProps) => {
  const isDark = useIsDarkContext();
  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
      className={`flex items-center justify-around`}
    >
      <Button variant="text" size={size}>
        Film Room
      </Button>
      <Button variant="text" size={size}>
        Highlight Factory
      </Button>
      <Button variant="text" size={size}>
        Team Profile
      </Button>
      <Button variant="text" size={size}>
        Inbox
      </Button>
    </div>
  );
};

export default MainMenu;
