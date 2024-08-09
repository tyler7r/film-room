import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useSearchContext } from "~/contexts/search";
import { useIsDarkContext } from "~/pages/_app";
import NavbarSearch from "../navbar-search";
import TeamPageButton from "../team-profile-btn";

const DesktopMainMenu = () => {
  const router = useRouter();
  const { searchOpen, setSearchOpen } = useSearchContext();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();

  const handleProfileClick = () => {
    if (user.userId) {
      void router.push(`/profile/${user.userId}`);
    } else {
      void router.push(`/login`);
    }
  };

  return (
    <div style={backgroundStyle} className="w-full">
      {searchOpen ? (
        <div className="grid grid-cols-2 items-center p-2">
          <div className="flex items-center justify-around">
            <Button
              onClick={handleProfileClick}
              variant="text"
              sx={{
                fontSize: "18px",
                fontWeight: "bold",
              }}
              endIcon={<PersonIcon />}
            >
              Profile
            </Button>
            <Button
              variant="text"
              onClick={() => void router.push("/film-room")}
              sx={{
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Film Room
            </Button>
            <TeamPageButton />
          </div>
          <NavbarSearch />
        </div>
      ) : (
        <div className="flex items-center justify-around">
          <Button
            onClick={handleProfileClick}
            variant="text"
            sx={{
              fontSize: "18px",
              fontWeight: "bold",
            }}
            endIcon={<PersonIcon />}
          >
            Profile
          </Button>
          <Button
            variant="text"
            onClick={() => void router.push("/film-room")}
            sx={{
              fontSize: searchOpen ? "14px" : "18px",
              fontWeight: "bold",
            }}
          >
            Film Room
          </Button>
          <TeamPageButton />
          <Button
            variant="text"
            sx={{
              fontSize: searchOpen ? "14px" : "18px",
              fontWeight: "bold",
            }}
            onClick={() => setSearchOpen(true)}
            endIcon={<SearchIcon />}
          >
            Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default DesktopMainMenu;
