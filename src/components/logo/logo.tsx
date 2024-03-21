import Image from "next/image";
import { useRouter } from "next/router";

type LogoProps = {
  size: "small" | "medium" | "large";
};

export const Logo = ({ size, ...props }: LogoProps) => {
  const router = useRouter();

  return (
    <div className="flex items-center p-0 text-center">
      <Image
        className="cursor-pointer"
        onClick={() => void router.push("/")}
        src="https://t4.ftcdn.net/jpg/03/42/40/31/360_F_342403172_c5dPVzqyfc1gUKakA9k5IzpKG4KTctz5.jpg"
        alt="Site logo"
        height={size === "small" ? 70 : 100}
        width={size === "small" ? 70 : 100}
        priority={true}
        {...props}
      />
    </div>
  );
};
