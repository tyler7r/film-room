import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/delete-menu";
import TeamLogo from "~/components/team-logo";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { UserTeamType } from "~/utils/types";

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
      <TeamLogo tm={request.team} size={30} />
      <div
        className={`${hoverText} text-center text-lg font-bold`}
        onClick={handleTeamClick}
      >
        {request.team.full_name}
      </div>
      <DeleteMenu
        handleDelete={handleDelete}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
      />
    </div>
  );
};

export default PendingRequest;
