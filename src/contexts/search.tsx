import { createContext, useContext, useState, type ReactNode } from "react";

type SearchProps = {
  children: ReactNode;
};

type SearchContextType = {
  // isOpen: boolean;
  // setIsOpen: (isOpen: boolean) => void;
  topic: string;
  setTopic: (topic: string) => void;
};

export const SearchContext = createContext<SearchContextType>({
  // isOpen: false,
  // setIsOpen: () => null,
  topic: "",
  setTopic: () => null,
});

export const GlobalSearch = ({ children }: SearchProps) => {
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");

  return (
    <SearchContext.Provider
      value={{
        // isOpen,
        // setIsOpen,
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
