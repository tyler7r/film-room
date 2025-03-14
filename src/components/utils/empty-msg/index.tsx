import { useIsDarkContext } from "~/pages/_app";

type EmptyMessageProps = {
  message: string;
  size: "small" | "medium" | "large";
};

const EmptyMessage = ({ message, size }: EmptyMessageProps) => {
  const { isDark } = useIsDarkContext();
  const fontSize =
    size === "small" ? "text-base" : size === "medium" ? "text-lg" : "text-xl";

  return (
    <div
      className={`text-center font-bold tracking-tight ${fontSize} ${
        isDark ? "text-grey-400" : "text-grey-600"
      }`}
    >
      No {message} found!
    </div>
  );
};

export default EmptyMessage;
