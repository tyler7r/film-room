import { Button, colors } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";

type MainMenuProps = {
  size: "small" | "medium" | "large";
};

const MainMenu = ({ size }: MainMenuProps) => {
  const router = useRouter();
  const isDark = useIsDarkContext();
  const { user } = useAuthContext();

  const handleClick = (isLoggedIn: boolean, path: string) => {
    if (isLoggedIn) {
      router.push(`/${path}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
      className={`flex items-center justify-around`}
    >
      <Button
        variant="text"
        size={size}
        onClick={() => handleClick(user.isLoggedIn, "film-room")}
      >
        Film Room
      </Button>
      <Button
        variant="text"
        size={size}
        onClick={() => handleClick(user.isLoggedIn, "highlight-factory")}
      >
        Highlight Factory
      </Button>
      <Button
        variant="text"
        size={size}
        onClick={() => handleClick(user.isLoggedIn, "team-profile")}
      >
        Team Profile
      </Button>
      <Button
        variant="text"
        size={size}
        onClick={() => handleClick(user.isLoggedIn, "inbox")}
      >
        Inbox
      </Button>
    </div>
  );
};

export default MainMenu;
