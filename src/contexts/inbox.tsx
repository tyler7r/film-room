import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { NotificationType } from "~/utils/types";
import { useAuthContext } from "./auth";
import { useMobileContext } from "./mobile";

type InboxProps = {
  children: ReactNode;
};

type InboxContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  notifications: NotificationType[] | null;
  setNotifications: (notifications: NotificationType[] | null) => void;
  notificationCount: number;
  setNotificationCount: (notificationCount: number) => void;
  unreadOnly: boolean;
  setUnreadOnly: (unreadOnly: boolean) => void;
  unreadCount: number;
  setUnreadCount: (unreadCount: number) => void;
};

export const InboxContext = createContext<InboxContextType>({
  isOpen: false,
  setIsOpen: () => null,
  page: 0,
  setPage: () => null,
  notifications: null,
  setNotifications: () => null,
  notificationCount: 0,
  setNotificationCount: () => null,
  unreadOnly: false,
  setUnreadOnly: () => null,
  unreadCount: 0,
  setUnreadCount: () => null,
});

export const TheInbox = ({ children }: InboxProps) => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();
  const itemsPerPage = isMobile ? 5 : 10;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [notifications, setNotifications] = useState<NotificationType[] | null>(
    null,
  );
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async (unreadOnly: boolean) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (user.userId) {
      const cmts = supabase
        .from("comment_notification")
        .select("*", { count: "exact" })
        .eq("play->>author_id", user.userId)
        .range(from, to)
        .order("comment->>created_at", { ascending: false });
      if (unreadOnly) {
        void cmts.eq("comment->>viewed", false);
      }
      const mntns = supabase
        .from("mention_notification")
        .select("*", { count: "exact" })
        .eq("mention->>receiver_id", user.userId)
        .range(from, to)
        .order("play->>created_at", { ascending: false });
      if (unreadOnly) {
        void mntns.eq("mention->>viewed", false);
      }

      const comments = await cmts;
      const mentions = await mntns;
      let notifs: NotificationType[] | null = null;
      let unread = 0;
      if (comments.data) {
        notifs = comments.data;
        const unreadComments = comments.data.filter(
          (cmt) => !cmt.comment.viewed,
        ).length;
        unread += unreadComments;
      }
      if (mentions.data) {
        notifs = notifs ? [...notifs, ...mentions.data] : mentions.data;
        const unreadMentions = mentions.data.filter(
          (mntn) => !mntn.mention.viewed,
        ).length;
        unread += unreadMentions;
      }
      setUnreadCount(unread);

      const sortedNotifs = notifs?.sort((a, b) => {
        return new Date(a.comment ? a.comment.created_at : a.play.created_at) <
          new Date(b.comment ? b.comment.created_at : b.play.created_at)
          ? 1
          : -1;
      });
      setNotifications(sortedNotifs ? sortedNotifs : null);
      setNotificationCount(
        sortedNotifs && sortedNotifs.length > 0 ? sortedNotifs.length : 0,
      );
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void fetchNotifications(unreadOnly);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("mention_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchNotifications(unreadOnly);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchNotifications(unreadOnly);
    else setPage(1);
  }, [user.userId, isOpen, unreadOnly]);

  useEffect(() => {
    void fetchNotifications(unreadOnly);
  }, [page]);

  return (
    <InboxContext.Provider
      value={{
        isOpen,
        setIsOpen,
        page,
        setPage,
        notifications,
        setNotifications,
        notificationCount,
        setNotificationCount,
        unreadOnly,
        setUnreadOnly,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInboxContext = () => {
  return useContext(InboxContext);
};
