import { createContext, useContext, useState, type ReactNode } from "react";

type SearchProps = {
  children: ReactNode;
};

type SearchContextType = {
  topic: string;
  setTopic: (topic: string) => void;
  searchOpen: boolean;
  setSearchOpen: (searchOpen: boolean) => void;
};

export const SearchContext = createContext<SearchContextType>({
  topic: "",
  setTopic: () => null,
  searchOpen: false,
  setSearchOpen: () => null,
});

export const GlobalSearch = ({ children }: SearchProps) => {
  const [topic, setTopic] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  return (
    <SearchContext.Provider
      value={{
        topic,
        setTopic,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  return useContext(SearchContext);
};
