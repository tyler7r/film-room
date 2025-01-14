import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useIsDarkContext } from "~/pages/_app";
import TeamPageButton from "../../team-profile-btn";

const MobileMainMenu = () => {
  const router = useRouter();
  const { backgroundStyle } = useIsDarkContext();
  const { isDark, setIsDark } = useIsDarkContext();

  return (
    <div style={backgroundStyle} className="w-full">
      <div className="flex items-center justify-around">
        <Button
          variant="text"
          onClick={() => void router.push("/film-room")}
          size="large"
          sx={{
            fontWeight: "bold",
          }}
        >
          Film Room
        </Button>
        <TeamPageButton />
        {isDark ? (
          <Button
            sx={{ fontWeight: "bold" }}
            endIcon={<DarkModeIcon />}
            onClick={() => setIsDark(false)}
          >
            Theme
          </Button>
        ) : (
          <Button
            onClick={() => setIsDark(true)}
            endIcon={<LightModeIcon />}
            sx={{ fontWeight: "bold" }}
          >
            Theme
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileMainMenu;
