import { Button } from "@mui/material";
import { useRouter } from "next/router";

const GuestMobileNav = () => {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-end gap-2 px-1">
      <Button
        variant="contained"
        size="small"
        onClick={() => void router.push("/signup")}
        sx={{ fontWeight: "bold" }}
      >
        Signup
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => void router.push("/login")}
        sx={{ fontWeight: "bold" }}
      >
        Login
      </Button>
    </div>
  );
};

export default GuestMobileNav;
