import { type PlayDirectoryType } from "~/utils/types";

type PlayDirectoryProps = {
  plays: PlayDirectoryType;
};

const PlayDirectory = ({ plays }: PlayDirectoryProps) => {
  return plays?.map((play) => (
    <div className="">
      <div>{play.author_name}</div>
      <div>{play.note}</div>
    </div>
  ));
};

export default PlayDirectory;
