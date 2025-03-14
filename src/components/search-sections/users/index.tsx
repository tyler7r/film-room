import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import User from "~/components/user";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { UserType } from "~/utils/types";

type SearchUsersProps = {
  topic: string;
};

const SearchUsers = ({ topic }: SearchUsersProps) => {
  const { isMobile } = useMobileContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserType[] | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 50;

  const fetchUsers = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .ilike("name", `%${topic}%`)
      .neq("name", "")
      .order("name")
      .range(from, to);
    if (data && data.length > 0) setUsers(data);
    else setUsers(null);
    if (count) setUserCount(count);
    else setUserCount(null);
    setLoading(false);
  });

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchUsers();
    else setPage(1);
  }, [topic, isMobile]);

  useEffect(() => {
    void fetchUsers();
  }, [page]);

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-4">
      {loading && <PageTitle title="Loading..." size="medium" />}
      {userCount && (
        <div className="font-bold tracking-tight">
          {userCount} results found
        </div>
      )}
      {!users && !loading && <EmptyMessage size="large" message="users" />}
      <div className="flex w-full flex-wrap justify-center gap-6">
        {users?.map((u) => <User user={u} key={u.id} goToProfile={true} />)}
      </div>
      {users && userCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, userCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SearchUsers;
