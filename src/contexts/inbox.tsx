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
  commentCount: number;
  setCommentCount: (commentCount: number) => void;
  unreadCount: number;
  setUnreadCount: (unreadCount: number) => void;
  unreadMentionCount: number;
  setUnreadMentionCount: (unreadCount: number) => void;
  unreadCommentCount: number;
  setUnreadCommentCount: (unreadCount: number) => void;
  commentPage: number;
  setCommentPage: (commentPage: number) => void;
};

export const InboxContext = createContext<InboxContextType>({
  isOpen: false,
  setIsOpen: () => null,
  page: 0,
  setPage: () => null,
  unreadCount: 0,
  setUnreadCount: () => null,
  mentionCount: 0,
  setMentionCount: () => null,
  unreadMentionCount: 0,
  setUnreadMentionCount: () => null,
  unreadCommentCount: 0,
  setUnreadCommentCount: () => null,
  commentCount: 0,
  setCommentCount: () => null,
  commentPage: 0,
  setCommentPage: () => null,
});

export const TheInbox = ({ children }: InboxProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [commentPage, setCommentPage] = useState<number>(0);
  const [unreadMentionCount, setUnreadMentionCount] = useState<number>(0);
  const [unreadCommentCount, setUnreadCommentCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(
    unreadCommentCount + unreadMentionCount,
  );
  const [mentionCount, setMentionCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setPage(0);
      setMentionCount(0);
      setCommentPage(0);
      setCommentCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setUnreadCount(unreadCommentCount + unreadMentionCount);
  }, [unreadCommentCount, unreadMentionCount]);

  return (
    <InboxContext.Provider
      value={{
        isOpen,
        setIsOpen,
        page,
        setPage,
        unreadCount,
        setUnreadCount,
        mentionCount,
        setMentionCount,
        unreadCommentCount,
        setUnreadCommentCount,
        unreadMentionCount,
        setUnreadMentionCount,
        setCommentCount,
        commentCount,
        commentPage,
        setCommentPage,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInboxContext = () => {
  return useContext(InboxContext);
};
