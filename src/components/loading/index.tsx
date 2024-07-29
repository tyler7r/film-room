import PageTitle from "../page-title";

type LoadingProps = {
  isLoading: boolean;
};

const Loading = ({ isLoading }: LoadingProps) => {
  return isLoading && <PageTitle title="Loading..." size="small" />;
};

export default Loading;
