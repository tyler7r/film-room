import { Avatar, colors } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamType;
  size?: number;
  inactive?: boolean;
  popover?: boolean;
};

const TeamLogo = ({ tm, size, inactive, popover }: TeamLogoProps) => {
  const { isDark } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleClick = () => {
    setIsOpen(false);
    if (inactive) return;
    else void router.push(`/team-hub/${tm.id}`);
  };

  return (
    <div
      className="flex items-center"
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
    >
      {popover && (
        <StandardPopover
          content={tm.full_name}
          open={open}
          anchorEl={anchorEl}
          handlePopoverClose={handlePopoverClose}
        />
      )}
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
              size && size === 150
                ? "72px"
                : size === 60
                  ? "28px"
                  : size === 35
                    ? "16px"
                    : "12px",
            fontWeight: "bold",
            fontStyle: "italic",
            fontFamily: "serif",
          }}
        >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</Avatar>
      )}
    </div>
  );
};

export default TeamLogo;
