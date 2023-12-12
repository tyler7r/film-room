import { Button, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";

type MenuItemsProps = {
  size: "small" | "medium" | "large";
};

const MenuItems = ({ size }: MenuItemsProps) => {
  const isDark = useIsDarkContext();
  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
      className={`flex items-center justify-around`}
    >
      <Button size={size} variant="text" href="/film-room">
        Film Room
      </Button>
      <Button size={size} variant="text" href="/highlight-factory">
        Highlight Factory
      </Button>
      <Button size={size} variant="text" href="/team-profile">
        Team Profile
      </Button>
      <Button size={size} variant="text" href="/inbox">
        Inbox
      </Button>
    </div>
  );
};

export default MenuItems;
