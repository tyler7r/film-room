import { Typography, useTheme } from "@mui/material";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { supabase } from "~/utils/supabase";
import { type GameListType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

export const getServerSideProps = (async () => {
  const gamesData = await supabase
    .from("games")
    .select(
      `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
    );
  const games: GameListType[] | null = gamesData.data;
  return { props: { games } };
}) satisfies GetServerSideProps<{ games: GameListType[] | null }>;

const FilmRoomHome = ({
  games,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { backgroundStyle, isDark } = useIsDarkContext();
  const theme = useTheme();

  const router = useRouter();

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center gap-4">
      <Typography variant="h1" fontSize={64}>
        Film
      </Typography>
      <div className="flex w-4/5 flex-col items-center justify-center gap-8">
        {games?.map((g) => (
          <div
            style={{
              backgroundColor: `${backgroundStyle.backgroundColor}`,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
            key={g.id}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-2"
            onClick={() => router.push(`/film-room/${g.id}/0`)}
          >
            <Typography
              color={isDark ? `white` : `black`}
              component="span"
              className="flex items-center justify-center gap-1"
            >
              <div>{g.season}</div>
              <div>{g.tournament}</div>
            </Typography>
            <div className="flex items-center gap-4">
              <Typography
                variant="button"
                className="text-center"
                fontWeight="bold"
                color="primary"
                fontSize={20}
              >
                {g.one?.city} {g.one?.name}
              </Typography>
              <Typography
                variant="overline"
                fontSize={16}
                color={isDark ? "white" : "black"}
              >
                vs
              </Typography>
              <Typography
                variant="button"
                className="text-center"
                fontWeight="bold"
                color="primary"
                fontSize={20}
              >
                {g.two?.city} {g.two?.name}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmRoomHome;
