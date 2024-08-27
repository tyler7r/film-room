import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import Collection from "~/components/collections/collection";
import CreateCollection from "~/components/collections/create-collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type SearchCollectionsProps = {
  topic: string;
};

const SearchCollections = ({ topic }: SearchCollectionsProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(true);

  const [collections, setCollections] = useState<CollectionViewType[] | null>(
    null,
  );
  const [collectionCount, setCollectionCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchCollections = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const collections = supabase
      .from("collection_view")
      .select("*", { count: "exact" })
      .ilike("collection->>title", `%${topic}%`)
      .order("collection->>created_at", { ascending: false })
      .range(from, to);
    if (affIds) {
      void collections.or(
        `collection->>private.eq.false, collection->>exclusive_to.in.(${affIds})`,
      );
    } else {
      void collections.eq("collection->>private", false);
    }
    const { data, count } = await collections;
    if (data && data.length > 0) setCollections(data);
    else setCollections(null);
    if (count) setCollectionCount(count);
    else setCollectionCount(null);
    setLoading(false);
  });

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchCollections();
    else setPage(1);
  }, [topic, isMobile]);

  useEffect(() => {
    void fetchCollections();
  }, [page]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {loading && <PageTitle title="Loading..." size="medium" />}
      {!loading && <CreateCollection />}
      {collectionCount && (
        <div className="font-bold tracking-tight">
          {collectionCount} results found
        </div>
      )}
      {!collections && !loading && (
        <EmptyMessage size="large" message="collections" />
      )}
      <div className="flex w-4/5 flex-wrap items-center justify-center gap-6">
        {collections?.map((collection) => (
          <Collection key={collection.collection.id} collection={collection} />
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
  );
};

export default SearchCollections;
