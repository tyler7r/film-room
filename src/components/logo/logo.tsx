import Image from "next/image";

type LogoProps = {
  size: "small" | "medium" | "large";
};

export const Logo = ({ size }: LogoProps) => {
  return (
    <div className="align-center flex p-0">
      <Image
        src="https://t4.ftcdn.net/jpg/03/42/40/31/360_F_342403172_c5dPVzqyfc1gUKakA9k5IzpKG4KTctz5.jpg"
        alt="Site logo"
        height={size === "small" ? 70 : 70}
        width={size === "small" ? 70 : 70}
        priority={true}
      />
      <div
        className="align-center flex flex-col justify-center text-center
      leading-5"
      >
        <div>The</div>
        <div>Film Room</div>
      </div>
    </div>
  );
};
