import { Avatar, Box, colors } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamType;
  size?: number;
  inactive?: boolean;
};

const TeamLogo = ({ tm, size, inactive }: TeamLogoProps) => {
  const { isDark } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();
  const router = useRouter();

  const handleClick = () => {
    setIsOpen(false);
    if (inactive) return;
    else void router.push(`/team-hub/${tm.id}`);
  };

  return (
    <Box
      className="flex items-center p-0"
      sx={{ display: "flex", alignItems: "center", padding: 0 }}
    >
      {tm.logo ? (
        <Image
          alt="team-logo"
          src={tm.logo}
          height={size ? size : 35}
          width={size ? size : 35}
          className="cursor-pointer rounded-full"
          onClick={handleClick}
        />
      ) : (
        <Avatar
          sx={{
            bgcolor: isDark ? colors.purple[400] : colors.purple.A400,
            width: size,
            height: size,
            fontSize:
              size && size < 150 && size > 60
                ? "48px"
                : size && size <= 60 && size > 35
                  ? "28px"
                  : size && size <= 35
                    ? "10px"
                    : "10px",
            fontWeight: "bold",
            fontStyle: "italic",
            fontFamily: "serif",
          }}
        >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</Avatar>
      )}
    </Box>
  );
};

export default TeamLogo;
