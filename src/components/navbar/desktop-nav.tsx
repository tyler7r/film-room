import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Switch, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { Button } from "../button/button";
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
        <Button label="Film Room" variant="text" size="large" />
        <Button label="Highlight Factory" variant="text" size="large" />
        <Button label="Team Profile" variant="text" size="large" />
        <Button label="Inbox" variant="text" size="large" />
      </div>
      <div className="align-center col-span-1 flex gap-2 self-center">
        <Button
          label="Signup"
          variant="contained"
          disabled={false}
          size="large"
        />
        <Button
          label="Login"
          variant="outlined"
          disabled={false}
          size="large"
        />
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
