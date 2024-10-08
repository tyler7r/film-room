import PublicIcon from "@mui/icons-material/Public";
import { colors, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";
import PageTitle from "../../utils/page-title";

type CollectionProps = {
  small?: boolean;
  collection: CollectionViewType;
  listItem?: boolean;
};

const Collection = ({ collection, small, listItem }: CollectionProps) => {
  const { backgroundStyle, hoverText, hoverBorder, isDark } =
    useIsDarkContext();
  const router = useRouter();

  const [playCount, setPlayCount] = useState<number>(0);

  const fetchPlayCount = async () => {
    const { count } = await supabase
      .from("collection_plays_view")
      .select("*", { count: "exact" })
      .eq("collection->>id", collection.collection.id);
    if (count) setPlayCount(count);
    else setPlayCount(0);
  };

  const handleClick = () => {
    if (listItem) return;
    else void router.push(`/collections/${collection.collection.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (listItem) return;
    else {
      e.stopPropagation();
      void router.push(`/profile/${collection.collection.author_id}`);
    }
  };

  useEffect(() => {
    void fetchPlayCount();
  }, []);

  return (
    <div
      className={`flex items-center justify-center gap-2 p-2 px-4 ${
        !listItem ? `${hoverBorder} flex-col rounded-md` : "w-full"
      }`}
      style={backgroundStyle}
      onClick={handleClick}
    >
      <div
        className={`flex items-center justify-center ${
          small ? "gap-4" : "gap-6"
        }`}
      >
        {collection.team ? (
          <TeamLogo
            tm={collection.team}
            size={small ? 25 : 60}
            inactive={true}
            popover={listItem ? false : true}
          />
        ) : (
          <PublicIcon fontSize={small ? "large" : "large"} color="action" />
        )}
        <div
          className={`flex ${
            !small ? "flex-col" : "gap-4"
          } w-full items-center justify-center`}
        >
          <div className="flex items-center justify-center gap-2">
            <PageTitle
              title={collection.collection.title}
              size={small ? "x-small" : "small"}
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            {!small && (
              <div className="text-sm font-light">
                {convertTimestamp(collection.collection.created_at)}
              </div>
            )}
            <Divider flexItem orientation="vertical" />
            <div
              className={`${
                !listItem && hoverText
              } w-full text-center font-bold tracking-tight`}
              onClick={handleProfileClick}
            >
              {collection.profile.name !== ""
                ? collection.profile.name
                : collection.profile.email!}
            </div>
          </div>
        </div>
        <div
          className={`flex items-center justify-center gap-1 rounded-lg p-2 ${
            small ? "" : "flex-col"
          }`}
          style={
            isDark
              ? { backgroundColor: `${colors.purple[200]}` }
              : { backgroundColor: `${colors.purple[50]}` }
          }
        >
          <div
            className={`${
              small ? "text-xl" : "text-3xl"
            } font-bold leading-7 tracking-tight`}
          >
            {playCount}
          </div>
          <div
            className={`${
              small ? "text-sm" : "text-base"
            } font-bold leading-5 tracking-tight`}
          >
            plays
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
