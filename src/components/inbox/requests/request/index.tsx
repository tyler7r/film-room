import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { useRouter } from "next/router";
import { useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import DeleteMenu from "~/components/utils/delete-menu";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { UserTeamType } from "~/utils/types";

type PendingRequestProps = {
  request: UserTeamType;
  reload: boolean;
  setReload: (reload: boolean) => void;
};

const PendingRequest = ({
  request,
  reload,
  setReload,
}: PendingRequestProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();

  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    await supabase
      .from("affiliations")
      .delete()
      .eq("id", request.affiliations.id);
    setReload(!reload);
  };

  const handleTeamClick = () => {
    void router.push(`/team-hub/${request.team.id}`);
    setIsOpen(false);
  };

  return (
    <div
      style={backgroundStyle}
      className="flex items-center justify-between gap-2 rounded-md p-2"
    >
      <TeamLogo tm={request.team} size={25} />
      <div
        className={`flex items-center justify-center gap-1 text-center`}
        onClick={handleTeamClick}
      >
        <div className={`${hoverText} text-lg font-bold tracking-tight`}>
          {request.team.full_name}
        </div>
        <ArrowRightAltIcon color="primary" fontSize="small" />{" "}
        <div className="">{request.affiliations.role}</div>
      </div>
      <DeleteMenu
        handleDelete={handleDelete}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        deleteType="request"
      />
    </div>
  );
};

export default PendingRequest;
