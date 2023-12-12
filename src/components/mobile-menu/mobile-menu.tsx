import { Button, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";

export const MobileMenu = () => {
  const isDark = useIsDarkContext();
  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
      className={`flex items-center justify-between`}
    >
      <Button variant="text" size="medium">
        Film Room
      </Button>
      <Button variant="text" size="medium">
        Highlight Factory
      </Button>
      <Button variant="text" size="medium">
        Team Profile
      </Button>
      <Button variant="text" size="medium">
        Inbox
      </Button>
    </div>
  );
};
