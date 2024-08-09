import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useSearchContext } from "~/contexts/search";
import { useIsDarkContext } from "~/pages/_app";
import NavbarSearch from "../navbar-search";
import TeamPageButton from "../team-profile-btn";

const MobileMainMenu = () => {
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
        <div className="p-2">
          <NavbarSearch />
        </div>
      ) : (
        <div className="flex items-center justify-around">
          <Button
            onClick={handleProfileClick}
            variant="text"
            size="large"
            sx={{
              fontWeight: "bold",
            }}
            endIcon={<PersonIcon fontSize="small" />}
          >
            Profile
          </Button>
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
          <Button
            variant="text"
            onClick={() => setSearchOpen(true)}
            endIcon={<SearchIcon />}
            size="large"
            sx={{
              fontWeight: "bold",
            }}
          >
            Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileMainMenu;
