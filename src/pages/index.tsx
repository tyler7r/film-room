import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { Button, Divider, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import PageTitle from "~/components/page-title";
import PlayPreview from "~/components/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import { useIsDarkContext } from "./_app";

const Home = () => {
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const { isMobile } = useMobileContext();

  const router = useRouter();
  const itemsPerPage = isMobile ? 10 : 20;

  const [page, setPage] = useState<number>(1);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);

  // const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("play_preview")
      .select("*", { count: "exact" })
      .order("play->>created_at", { ascending: false })
      .range(from, to);
    if (user.isLoggedIn && user.currentAffiliation?.team.id) {
      void plays.or(
        `play->>private.eq.false, play->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void plays.eq("play->>private", false);
    }
    const { data, count } = await plays;
    if (count) setPlayCount(count);
    if (data && data.length > 0) setPlays(data);
    else {
      setPlays(null);
    }
  };

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  useEffect(() => {
    if (page === 1) void fetchPlays();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchPlays();
  }, [page]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <Divider flexItem>
        <PageTitle size="x-large" title="Inside Break" />
      </Divider>
      {user.userId ? (
        <div className="flex gap-4">
          <Button
            variant="outlined"
            size="large"
            onClick={() => void router.push(`/profile/${user.userId}`)}
          >
            Profile
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => void router.push("/search")}
          >
            Search
          </Button>
        </div>
      ) : (
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
      )}
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
      <div className="flex items-center justify-center gap-4" ref={topRef}>
        <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
        <div className="text-2xl font-bold tracking-tight">
          OR GET INSPIRED!
        </div>
        <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
      </div>
      {plays?.map((play) => (
        <PlayPreview preview={play} key={Math.random() * 10000000} />
      ))}
      {plays && playCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="small"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, playCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Home;
