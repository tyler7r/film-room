import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import User from "~/components/user";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { UserType } from "~/utils/types";

type SearchUsersProps = {
  topic: string;
};

const SearchUsers = ({ topic }: SearchUsersProps) => {
  const { isMobile } = useMobileContext();

  const [users, setUsers] = useState<UserType[] | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);

  const fetchUsers = async () => {
    const { from, to } = getFromAndTo();
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

  const getFromAndTo = () => {
    const itemPerPage = isMobile ? 5 : 10;
    const from = (page - 1) * itemPerPage;
    const to = from + itemPerPage - 1;

    return { from, to };
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchUsers();
    else setPage(1);
  }, [topic]);

  useEffect(() => {
    void fetchUsers();
  }, [page]);

  return (
    <div className="mt-2 flex w-11/12 flex-col items-center justify-center gap-6">
      {!users && <EmptyMessage message="users" />}
      <div className="align-center flex flex-wrap justify-center gap-6">
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
          count={getNumberOfPages(isMobile, userCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SearchUsers;
