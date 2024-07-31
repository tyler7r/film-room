import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";
import Collection from "../collection";
import EmptyMessage from "../empty-msg";
import PageTitle from "../page-title";

type TeamCollectionsProps = {
  teamId: string;
};

const TeamCollections = ({ teamId }: TeamCollectionsProps) => {
  const { isMobile } = useMobileContext();

  const [collections, setCollections] = useState<CollectionViewType[] | null>(
    null,
  );
  const [collectionCount, setCollectionCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

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
      <PageTitle size="medium" title="Team Collections" />
      {!collections && <EmptyMessage size="large" message="collections" />}
      <div className="flex w-full flex-wrap items-center justify-center gap-6">
        {collections?.map((collection) => (
          <Collection key={collection.collection.id} collection={collection} />
        ))}
      </div>
      {collections && collectionCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="medium"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, collectionCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TeamCollections;
