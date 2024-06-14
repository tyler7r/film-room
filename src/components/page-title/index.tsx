type PageTitleProps = {
  title: string;
};

const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="text-center font-serif text-6xl italic tracking-tighter md:text-8xl">
      {title}
    </div>
  );
};

export default PageTitle;
