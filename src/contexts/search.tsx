import { createContext, useContext, useState, type ReactNode } from "react";

type SearchProps = {
  children: ReactNode;
};

type SearchContextType = {
  topic: string;
  setTopic: (topic: string) => void;
};

export const SearchContext = createContext<SearchContextType>({
  topic: "",
  setTopic: () => null,
});

export const GlobalSearch = ({ children }: SearchProps) => {
  const [topic, setTopic] = useState<string>("");

  return (
    <SearchContext.Provider
      value={{
        topic,
        setTopic,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  return useContext(SearchContext);
};
