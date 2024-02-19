import { Typography } from "@mui/material";
import { type PlayDirectoryType } from "~/utils/types";

type PlayDirectoryProps = {
  plays: PlayDirectoryType | null;
};

const PlayDirectory = ({ plays }: PlayDirectoryProps) => {
  return plays ? (
    plays.map((play) => (
      <div className="">
        <div>{play.author_name}</div>
        <div>{play.note}</div>
      </div>
    ))
  ) : (
    <Typography>Play directory is empty!</Typography>
  );
};

export default PlayDirectory;
