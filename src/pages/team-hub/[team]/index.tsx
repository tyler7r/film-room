import { useRouter } from "next/router";

const TeamHub = () => {
  const router = useRouter();
  return <div>{router.query.team}</div>;
};

export default TeamHub;
