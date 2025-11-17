import GuestHome from "~/components/home-page/guest";
import ActionDashboard from "~/components/home-page/user";
import { useAuthContext } from "~/contexts/auth";

const Home = () => {
  const { user } = useAuthContext();
  return user.isLoggedIn ? <ActionDashboard /> : <GuestHome />;
};

export default Home;
