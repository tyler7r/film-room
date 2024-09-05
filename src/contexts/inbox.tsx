import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import type { NotificationType } from "~/utils/types";
import { useAuthContext } from "./auth";

type InboxProps = {
  children: ReactNode;
};

type InboxContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationType[] | null>(
    null,
  );
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async (unreadOnly: boolean) => {
    if (user.userId) {
      const cmts = supabase
        .from("comment_notification")
        .select("*", { count: "exact" })
        .eq("play->>author_id", user.userId)
        .neq("comment->>comment_author", user.userId)
        .order("comment->>created_at", { ascending: false });
      if (unreadOnly) {
        void cmts.eq("comment->>viewed", false);
      }
      const mntns = supabase
        .from("mention_notification")
        .select("*", { count: "exact" })
        .eq("mention->>receiver_id", user.userId)
        .neq("mention->>sender_id", user.userId)
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
    } else {
      setNotificationCount(0);
      setNotifications(null);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    void fetchNotifications(unreadOnly);
  }, [user.userId, isOpen, unreadOnly]);

  return (
    <InboxContext.Provider
      value={{
        isOpen,
        setIsOpen,
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
