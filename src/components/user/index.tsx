import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import { UserType } from "~/utils/types";

type UserProps = {
  user: UserType;
};

const User = ({ user }: UserProps) => {
  const { backgroundStyle, isDark } = useIsDarkContext();
  const router = useRouter();

  const handleClick = (userId: string) => {
    void router.push(`/profile/${userId}`);
  };

  return (
    <div
      style={backgroundStyle}
      className={`${
        isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
      } flex cursor-pointer flex-col gap-1 border-2 border-solid border-transparent p-2 px-10 transition ease-in-out hover:rounded-sm hover:border-solid hover:delay-100`}
      onClick={() => handleClick(user.id)}
    >
      <div className="text-lg font-bold">{user.name}</div>
    </div>
  );
};

export default User;
