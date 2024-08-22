import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import Collection from "~/components/collections/collection";
import CreateCollection from "~/components/collections/create-collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type ProfileCollectionsProps = {
  profileId: string;
};

const ProfileCollections = ({ profileId }: ProfileCollectionsProps) => {
  const { isMobile } = useMobileContext();

  const [collections, setCollections] = useState<CollectionViewType[] | null>(
    null,
  );
  const [collectionCount, setCollectionCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 5 : 10;

  const fetchCollections = async () => {
    if (profileId) {
      const { from, to } = getToAndFrom(itemsPerPage, page);
      const { data, count } = await supabase
        .from("collection_view")
        .select("*", { count: "exact" })
        .eq("collection->>author_id", profileId)
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
    const channel = supabase
      .channel("collection_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          void fetchCollections();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchCollections();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchCollections();
  }, [page]);

  return (
    <div className="mb-2 flex w-full flex-col items-center justify-center gap-2">
      <PageTitle size="small" title="User Collections" />
      {!collections && <EmptyMessage size="small" message="collections" />}
      <div className="mb-4 flex w-full flex-wrap items-center justify-center gap-6">
        {collections?.map((collection) => (
          <Collection
            key={collection.collection.id}
            collection={collection}
            small={true}
          />
        ))}
      </div>
      <CreateCollection small={true} />
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

export default ProfileCollections;
