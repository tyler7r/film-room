import { useIsDarkContext } from "~/pages/_app";

type PageTitleProps = {
  title: string;
  size: "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large";
  purple?: boolean;
};

const PageTitle = ({ title, size, purple }: PageTitleProps) => {
  const { isDark } = useIsDarkContext();

  const textSize =
    size === "xx-small"
      ? "text-base md:text-lg"
      : size === "x-small"
        ? "text-xl md:text-2xl"
        : size === "small"
          ? "text-3xl md:text-4xl"
          : size === "medium"
            ? "text-4xl md:text-5xl"
            : size === "large"
              ? "text-5xl md:text-6xl"
              : "text-6xl md:text-8xl";

  return (
    <div
      className={`w-full text-center font-bold tracking-tighter ${textSize} ${
        purple && isDark
          ? "text-purple-400"
          : purple
            ? "text-purple-A400"
            : null
      }`}
    >
      {title}
    </div>
  );
};

export default PageTitle;
