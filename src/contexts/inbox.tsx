import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type InboxProps = {
  children: ReactNode;
};

type InboxContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  mentionCount: number;
  setMentionCount: (mentionCount: number) => void;
};

export const InboxContext = createContext<InboxContextType>({
  isOpen: false,
  setIsOpen: () => null,
  page: 0,
  setPage: () => null,
  mentionCount: 0,
  setMentionCount: () => null,
});

export const TheInbox = ({ children }: InboxProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [mentionCount, setMentionCount] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setPage(0);
      setMentionCount(0);
    }
  }, [isOpen]);

  return (
    <InboxContext.Provider
      value={{
        isOpen,
        setIsOpen,
        page,
        setPage,
        mentionCount,
        setMentionCount,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInboxContext = () => {
  return useContext(InboxContext);
};
