import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import TeamPageButton from "../../team-profile-btn";

const GuestDesktopNav = () => {
  const router = useRouter();
  return (
    <div className="ml-3 flex w-full items-center justify-between">
      <div className="flex w-full items-center justify-start gap-1">
        <Button
          variant="text"
          sx={{ fontWeight: "bold", wordSpacing: "-1px" }}
          size="large"
          onClick={() => void router.push("/film-room")}
        >
          Film Room
        </Button>
        <TeamPageButton />
        <IconButton
          size="small"
          onClick={() => void router.push("/search/users")}
        >
          <SearchIcon />
        </IconButton>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="contained"
          size="small"
          onClick={() => void router.push("/signup")}
          sx={{ fontWeight: "bold " }}
        >
          Signup
        </Button>
        <Button
          variant="outlined"
          disabled={false}
          size="small"
          onClick={() => void router.push("/login")}
          sx={{ fontWeight: "bold " }}
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
