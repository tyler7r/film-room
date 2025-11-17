import Image from "next/image";
import { useRouter } from "next/router";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import LargeDarkLogoEffect from "../../../../public/logos/Large Dark Icon - Effect.png";
import LargeLightLogoEffect from "../../../../public/logos/Large Light Icon - Effect.png";
import SmallDarkLogoEffect from "../../../../public/logos/Small Dark Icon - Effect.png";
import SmallLightLogoEffect from "../../../../public/logos/Small Light Icon - Effect.png";

type LogoProps = {
  size: "small" | "medium" | "large" | "small-full" | "mobile-drawer";
};

export const Logo = ({ size, ...props }: LogoProps) => {
  const router = useRouter();
  const { isDark } = useIsDarkContext();
  const { fullScreen } = useMobileContext();

  return size === "small" ? (
    <Image
      className="mx-2 cursor-pointer"
      onClick={() => void router.push("/")}
      fill={false}
      src={isDark ? SmallDarkLogoEffect : SmallLightLogoEffect}
      alt="Site logo"
      height={40}
      width={56}
      priority={true}
      {...props}
    />
  ) : size === "small-full" ? (
    <Image
      className="cursor-pointer"
      onClick={() => void router.push("/")}
      fill={false}
      src={isDark ? SmallDarkLogoEffect : SmallLightLogoEffect}
      alt="Site logo"
      height={50}
      width={70}
      priority={true}
      {...props}
    />
  ) : size === "mobile-drawer" ? (
    <Image
      className="cursor-pointer"
      onClick={() => void router.push("/")}
      fill={false}
      src={isDark ? LargeDarkLogoEffect : LargeLightLogoEffect}
      alt="Site logo"
      height={72}
      width={225}
      priority={true}
      {...props}
    />
  ) : (
    <Image
      className="cursor-pointer"
      onClick={() => void router.push("/")}
      fill={false}
      src={isDark ? LargeDarkLogoEffect : LargeLightLogoEffect}
      alt="Site logo"
      height={size === "medium" ? 100 : fullScreen ? 150 : 150}
      width={size === "medium" ? 333 : fullScreen ? 500 : 500}
      priority={true}
      {...props}
    />
  );
};
