import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Divider, IconButton, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import Collection from "~/components/collections/collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type TeamCollectionsProps = {
  teamId: string;
};

const TeamCollections = ({ teamId }: TeamCollectionsProps) => {
  const { isMobile } = useMobileContext();

  const [collections, setCollections] = useState<CollectionViewType[] | null>(
    null,
  );
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [hide, setHide] = useState(false);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 5 : 10;

  const fetchCollections = async () => {
    if (teamId) {
      const { from, to } = getToAndFrom(itemsPerPage, page);
      const { data, count } = await supabase
        .from("collection_view")
        .select("*", { count: "exact" })
        .eq("collection->>exclusive_to", teamId)
        .order("collection->>created_at", { ascending: false })
        .range(from, to);
      if (data && data.length > 0) setCollections(data);
      else setCollections(null);
      if (count) setCollectionCount(count);
      else setCollectionCount(null);
    } else {
      setCollections(null);
      setCollectionCount(null);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchCollections();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchCollections();
  }, [page]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <div className="flex w-full items-center justify-center gap-2">
        <PageTitle size="small" title="Team Collections" />
        {hide ? (
          <IconButton onClick={() => setHide(false)} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setHide(true)} size="small">
            <KeyboardArrowDownIcon />
          </IconButton>
        )}
      </div>
      {!collections && <EmptyMessage message="collections" />}
      {!hide && (
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <div className="flex w-full flex-wrap items-center justify-center gap-6">
            {collections?.map((collection) => (
              <Collection
                key={collection.collection.id}
                collection={collection}
              />
            ))}
          </div>
          {collections && collectionCount && (
            <Pagination
              siblingCount={1}
              boundaryCount={0}
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
              sx={{ marginTop: "8px" }}
              variant="text"
              shape="rounded"
              count={getNumberOfPages(itemsPerPage, collectionCount)}
              page={page}
              onChange={handlePageChange}
            />
          )}
        </div>
      )}
      {hide && <Divider flexItem />}
    </div>
  );
};

export default TeamCollections;
