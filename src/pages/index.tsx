import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { CircularProgress, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "utils/supabase/component";
import { Logo } from "~/components/navbar/logo/logo";
import PlayPreview from "~/components/plays/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import type { PlayPreviewType } from "~/utils/types";
import { useIsDarkContext } from "./_app";

const Home = () => {
  const { affIds } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const { isMobile, screenWidth } = useMobileContext();

  const router = useRouter();
  const itemsPerPage = isMobile ? 5 : 10;

  const [page, setPage] = useState<number>(1);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("play_preview")
      .select("*", { count: "exact" })
      .eq("play->>post_to_feed", true)
      .order("play->>created_at", { ascending: false })
      .range(from, to);
    if (affIds && affIds.length > 0) {
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
    setLoading(false);
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
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchPlays();
    else setPage(1);
  }, [isMobile, affIds]);

  useEffect(() => {
    void fetchPlays();
  }, [page]);

  return loading ? (
    <div className="flex h-full w-full items-center justify-center p-4">
      <CircularProgress size={128} />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      {screenWidth > 525 ? <Logo size="large" /> : <Logo size="medium" />}
      <div className="items-center justify-center text-xl">
        <div className="text-center">
          The film can't analyze itself.{" "}
          <strong
            onClick={() => void router.push("/film-room")}
            className={`${hoverText} tracking-tight`}
          >
            Get started!
          </strong>
        </div>
      </div>
      <div
        className="flex items-center justify-center gap-4 text-center"
        ref={topRef}
      >
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
          siblingCount={1}
          boundaryCount={0}
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size={isMobile ? "small" : "medium"}
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
