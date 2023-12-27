import { Button, Typography } from "@mui/material";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { supabase } from "~/utils/supabase";
import { useIsDarkContext } from "../_app";

type GameListType = {
  id: string;
  link: string | null;
  one_id: string;
  season: string | null;
  tournament: string | null;
  two_id: string;
  one: {
    id: string;
    city: string;
    name: string;
  } | null;
  two: {
    id: string;
    city: string;
    name: string;
  } | null;
}[];

export const getServerSideProps = (async () => {
  const gamesData = await supabase
    .from("games")
    .select(
      `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
    );
  const games: GameListType | null = gamesData.data;
  if (gamesData.error) console.log(gamesData.error);
  return { props: { games } };
}) satisfies GetServerSideProps<{ games: GameListType | null }>;

const FilmRoomHome = ({
  games,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { backgroundStyle, isDark } = useIsDarkContext();

  const router = useRouter();

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center gap-4">
      <Typography variant="h1" fontSize={64}>
        Film
      </Typography>
      <div className="flex w-4/5 flex-col items-center justify-center gap-8">
        {games?.map((game) => (
          <Button
            style={backgroundStyle}
            variant="outlined"
            key={game.id}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-2"
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
                variant="h6"
                className="text-center"
                fontWeight="bold"
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
                variant="h6"
                className="text-center"
                fontWeight="bold"
              >
                {game.two?.city} {game.two?.name}
              </Typography>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilmRoomHome;
