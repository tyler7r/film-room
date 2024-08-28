import SettingsIcon from "@mui/icons-material/Settings";
import { Badge, IconButton, Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/utils/delete-menu";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { TeamActionBarType, TeamType } from "~/utils/types";

type TeamActionBarProps = {
  role: string;
  actionBarStatus: TeamActionBarType;
  setActionBarStatus: (status: TeamActionBarType) => void;
  team: TeamType;
  requestCount: number;
};

const TeamActionBar = ({
  role,
  actionBarStatus,
  setActionBarStatus,
  team,
  requestCount,
}: TeamActionBarProps) => {
  const router = useRouter();
  const { setAffReload } = useAuthContext();

  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModalToggle = (modal: string, open: boolean) => {
    if (modal === "roster") {
      setActionBarStatus({
        requests: false,
        transferOwner: false,
      });
    } else if (modal === "requests") {
      setActionBarStatus({
        requests: open,
        transferOwner: false,
      });
    } else {
      setActionBarStatus({
        requests: false,
        transferOwner: open,
      });
    }
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id)
      .select();
    handleClose();
    if (data) {
      setAffReload(true);
      void router.push("/");
    }
  };

  return (
    <div>
      {(role === "owner" || role === "coach") && (
        <>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{ display: "flex" }}
          >
            <SettingsIcon fontSize="large" color="primary" />
            {!open && (
              <Badge
                badgeContent={requestCount}
                overlap="circular"
                sx={{
                  alignSelf: "start",
                  ml: "2px",
                }}
                color="primary"
              />
            )}
          </IconButton>
          {open && (
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleModalToggle("requests", !actionBarStatus.requests);
                  handleClose();
                }}
              >
                <div className="flex">
                  <div className="font-bold tracking-tight">JOIN REQUESTS</div>
                  <Badge
                    badgeContent={requestCount}
                    color="primary"
                    sx={{ alignSelf: "start", ml: "12px" }}
                  />
                </div>
              </MenuItem>
              {role === "owner" && (
                <div>
                  <MenuItem
                    onClick={() => {
                      handleModalToggle(
                        "transferOwner",
                        !actionBarStatus.transferOwner,
                      );
                      handleClose();
                    }}
                  >
                    <div className="font-bold tracking-tight">
                      TRANSFER OWNERSHIP
                    </div>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      void router.push(`/team-settings/${team.id}`);
                    }}
                  >
                    <div className="font-bold tracking-tight">
                      TEAM SETTINGS
                    </div>
                  </MenuItem>
                  <MenuItem>
                    <DeleteMenu
                      handleDelete={handleDelete}
                      isOpen={deleteOpen}
                      setIsOpen={setDeleteOpen}
                      deleteType="team"
                      actionMenu={true}
                    />
                  </MenuItem>
                </div>
              )}
            </Menu>
          )}
        </>
      )}
    </div>
  );
};

export default TeamActionBar;
