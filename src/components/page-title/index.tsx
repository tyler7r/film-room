type PageTitleProps = {
  title: string;
  size: "small" | "medium" | "large";
};

const PageTitle = ({ title, size }: PageTitleProps) => {
  const textSize =
    size === "small"
      ? "text-3xl md:text-4xl"
      : size === "medium"
        ? "text-4xl md:text-5xl"
        : "text-6xl md:text-8xl";

  return (
    <div
      className={`text-center font-serif italic tracking-tighter ${textSize}`}
    >
      {title}
    </div>
  );
};

export default PageTitle;
