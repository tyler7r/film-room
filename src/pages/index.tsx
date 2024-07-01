import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageTitle from "~/components/page-title";
import PlayPreview from "~/components/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import { useIsDarkContext } from "./_app";
import Profile from "./profile/[user]";

const Home = () => {
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();

  const router = useRouter();
  const itemsPerPage = 3;

  const [page, setPage] = useState<number>(1);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("play_preview")
      .select("*", { count: "exact" })
      .range(from, to)
      .eq("play->>private", false)
      .order("play->>created_at");
    setPage(page + 1);
    if (!count || to >= count - 1) setIsBtnDisabled(true);
    if (data && data.length > 0) setPlays(plays ? [...plays, ...data] : data);
    else {
      setPlays(null);
      setIsBtnDisabled(true);
    }
  };

  useEffect(() => {
    void fetchPlays();
  }, []);

  return user.isLoggedIn ? (
    <Profile />
  ) : (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <PageTitle size="x-large" title="Inside Break" />
      <div className="flex gap-4">
        <Button
          variant="outlined"
          size="large"
          onClick={() => void router.push("/signup")}
        >
          Signup
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => void router.push("/login")}
        >
          Login
        </Button>
      </div>
      <div className="items-center justify-center text-xl">
        <div className="text-center">
          The film can't analyze itself.{" "}
          <strong
            onClick={() => void router.push("/film-room")}
            className={hoverText}
          >
            Get started!
          </strong>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
        <div className="text-2xl font-bold tracking-tight">
          OR GET INSPIRED!
        </div>
        <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
      </div>
      {plays?.map((play) => (
        <PlayPreview preview={play} key={Math.random() * 10000000} />
      ))}
      <Button
        disabled={isBtnDisabled}
        onClick={() => void fetchPlays()}
        style={{ width: "100%", fontSize: "24px" }}
        size="large"
      >
        Load More
      </Button>
    </div>
  );
};

export default Home;
