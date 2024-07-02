import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import User from "~/components/user";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { UserType } from "~/utils/types";

type SearchUsersProps = {
  topic: string;
};

const SearchUsers = ({ topic }: SearchUsersProps) => {
  const { isMobile } = useMobileContext();

  const [users, setUsers] = useState<UserType[] | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchUsers = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .ilike("name", `%${topic}%`)
      .range(from, to);
    if (data && data.length > 0) setUsers(data);
    else setUsers(null);
    if (count) setUserCount(count);
    else setUserCount(null);
  };

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
    <div className="mt-2 flex w-11/12 flex-col items-center justify-center gap-6">
      {!users && <EmptyMessage size="large" message="users" />}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {users?.map((u) => <User user={u} key={u.id} />)}
      </div>
      {users && userCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="small"
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
