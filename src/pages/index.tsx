import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Divider, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import PlayPreview from "~/components/plays/play_preview";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import { useIsDarkContext } from "./_app";

const Home = () => {
  const { user, affIds } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const { isMobile } = useMobileContext();

  const router = useRouter();
  const itemsPerPage = isMobile ? 10 : 20;

  const [page, setPage] = useState<number>(1);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("play_preview")
      .select("*", { count: "exact" })
      .order("play->>created_at", { ascending: false })
      .range(from, to);
    if (affIds) {
      void plays.or(
        `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
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
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  useEffect(() => {
    if (page === 1) void fetchPlays();
    else setPage(1);
  }, [isMobile, affIds]);

  useEffect(() => {
    void fetchPlays();
  }, [page]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <Divider flexItem variant="middle">
        <PageTitle size="x-large" title="Inside Break" />
      </Divider>
      {user.userId ? (
        <div className="flex gap-4">
          <Button
            variant="outlined"
            size="large"
            onClick={() => void router.push(`/profile/${user.userId}`)}
            startIcon={<PersonIcon />}
          >
            Profile
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => void router.push("/search/videos")}
            startIcon={<SearchIcon />}
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
      <div className="grid grid-cols-1 items-center justify-center gap-6">
        {plays?.map((play) => (
          <PlayPreview preview={play} key={play.play.id} />
        ))}
      </div>
      {plays && playCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="medium"
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
