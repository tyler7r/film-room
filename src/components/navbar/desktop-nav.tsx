import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Switch, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
// import { Button } from "../button/button";
import { Logo } from "../logo/logo";

type DesktopNavProps = {
  switchTheme: () => void;
};

const DesktopNav = ({ switchTheme }: DesktopNavProps) => {
  const isDark = useIsDarkContext();

  return (
    <div className="align-items-center grid grid-cols-5 gap-5 px-3">
      <Logo size="large" />
      <div
        style={{
          borderColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
        }}
        className="align-center wrap col-span-3 flex flex-wrap justify-around self-center border-solid"
      >
        <Button variant="text" size="large" href="/film-room">
          Film Room
        </Button>
        <Button variant="text" size="large">
          Highlight Factory
        </Button>
        <Button variant="text" size="large">
          Team Profile
        </Button>
        <Button variant="text" size="large">
          Inbox
        </Button>
      </div>
      <div className="align-center col-span-1 flex gap-2 self-center">
        <Button variant="contained" size="large" href="/signup">
          Signup
        </Button>
        <Button variant="outlined" disabled={false} size="large" href="/login">
          Login
        </Button>
        <Switch
          className="align-center justify-center self-center"
          icon={<LightModeIcon color="primary" fontSize="small" />}
          onChange={switchTheme}
          checkedIcon={<DarkModeIcon fontSize="small" />}
        />
      </div>
    </div>
  );
};

export default DesktopNav;
