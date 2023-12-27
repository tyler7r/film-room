import { Typography, useTheme } from "@mui/material";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { supabase } from "~/utils/supabase";
import { GameListType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

export const getServerSideProps = (async () => {
  const gamesData = await supabase
    .from("games")
    .select(
      `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
    );
  const games: GameListType[] | null = gamesData.data;
  if (gamesData.error) console.log(gamesData.error);
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
        {games?.map((game) => (
          <div
            style={{
              backgroundColor: `${backgroundStyle.backgroundColor}`,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
            key={game.id}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-2"
            onClick={() => router.push(`/film-room/${game.id}`)}
          >
            <Typography
              color={isDark ? `white` : `black`}
              className="flex items-center justify-center gap-1"
            >
              <div>{game.season}</div>
              <div>{game.tournament}</div>
            </Typography>
            <div className="flex items-center gap-4">
              <Typography
                variant="button"
                className="text-center"
                fontWeight="bold"
                color="primary"
                fontSize={20}
              >
                {game.one?.city} {game.one?.name}
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
                {game.two?.city} {game.two?.name}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmRoomHome;
