import { useSearchParams } from "next/navigation";

const Search = () => {
  const topic = useSearchParams().get("topic") ?? "";

  return (
    <div>
      <div>Search Page</div>
    </div>
  );
};

export default Search;
