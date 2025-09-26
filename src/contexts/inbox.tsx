import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import { type UnifiedNotificationType } from "~/utils/types";
import { useAuthContext } from "./auth";
import { useMobileContext } from "./mobile";

type InboxContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  notifications: UnifiedNotificationType[] | null; // Changed type
  setNotifications: (notifications: UnifiedNotificationType[]) => void;
  notificationCount: number;
  setNotificationCount: (notificationCount: number) => void;
  unreadOnly: boolean;
  setUnreadOnly: (unreadOnly: boolean) => void;
  unreadCount: number;
  setUnreadCount: (unreadCount: number) => void;
  // New props for infinite scroll management
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  hasMoreNotifications: boolean;
  loadMoreNotifications: () => void;
  // You might add a ref to the scrollable container if it's external to the context
  inboxScrollableRef: React.RefObject<HTMLDivElement>;
  updateSingleNotificationViewStatus: (id: string, isViewed: string) => void;
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
  isLoadingInitial: true,
  isLoadingMore: false,
  hasMoreNotifications: false,
  loadMoreNotifications: () => null,
  inboxScrollableRef: React.createRef(),
  updateSingleNotificationViewStatus: () => null,
});

type InboxProps = {
  children: ReactNode;
};

export const TheInbox = ({ children }: InboxProps) => {
  const { user } = useAuthContext();
  const { xlScreen, isMobile } = useMobileContext(); // Added isMobile for itemsPerLoad

  const [isOpen, setIsOpen] = useState<boolean>(xlScreen ? true : false);
  // Changed state to an empty array for consistent rendering with InfiniteScroll
  const [notifications, setNotifications] = useState<UnifiedNotificationType[]>(
    [],
  );
  const [notificationCount, setNotificationCount] = useState<number>(0); // Total count for display
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Infinite Scroll States
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMoreNotifications, setHasMoreNotifications] =
    useState<boolean>(true);

  const inboxScrollableRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  const itemsPerLoad = isMobile ? 15 : 30; // Adjust batch size as needed

  // Fetch notifications using the new unified view

  const fetchGlobalUnreadCount = useCallback(async () => {
    if (!user.userId) return 0;

    try {
      // CRITICAL: Query without LIMIT/OFFSET/RANGE to get the total count
      const { count, error } = await supabase
        .from("user_notifications_view")
        .select("*", { count: "exact", head: true }) // head: true for performance
        .eq("receiver_id", user.userId)
        .neq("actor_id", user.userId)
        .eq("viewed", false); // Filter only for unread

      if (error) {
        console.error("Error fetching global unread count:", error);
        return 0;
      }

      return count ?? 0;
    } catch (error) {
      console.error("Unexpected error in fetchGlobalUnreadCount:", error);
      return 0;
    }
  }, [user.userId]);

  const fetchNotifications = useCallback(
    async (
      currentOffset: number,
      append: boolean,
      filterUnreadOnly: boolean,
    ) => {
      if (!user.userId) {
        setIsLoadingInitial(false);
        setNotifications([]);
        setNotificationCount(0);
        setUnreadCount(0);
        setHasMoreNotifications(false);
        return;
      }

      const globalUnreadCount = await fetchGlobalUnreadCount();
      // Set the state based on this dedicated query result
      setUnreadCount(globalUnreadCount);

      if (!append) {
        setIsLoadingInitial(true);
        setNotifications([]); // Clear existing notifications for initial load/reset
        setOffset(0);
        setHasMoreNotifications(true);
        setNotificationCount(0); // Reset total count during initial load
      } else {
        setIsLoadingMore(true);
      }

      try {
        let query = supabase
          .from("user_notifications_view") // Query your new combined view
          .select("*", { count: "exact" })
          .eq("receiver_id", user.userId) // Filter for the current user
          .neq("actor_id", user.userId)
          .order("created_at", { ascending: false }); // Sort by creation time

        if (filterUnreadOnly) {
          query = query.eq("viewed", false);
        }

        const rangeEnd = currentOffset + itemsPerLoad - 1;
        query = query.range(currentOffset, rangeEnd);

        const { data, count, error } = await query;

        if (error) {
          console.error("Error fetching notifications:", error);
          setHasMoreNotifications(false);
          if (!append) setNotifications([]); // Clear on error for initial load
          return;
        }

        console.log("run", data);

        if (data) {
          setNotifications((prevNotifs) =>
            append ? [...prevNotifs, ...data] : data,
          );
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          if (count !== null) {
            setNotificationCount(count); // Set total count for display
            setHasMoreNotifications(newOffset < count);
          } else {
            setHasMoreNotifications(data.length === itemsPerLoad);
            setNotificationCount(
              append ? notifications.length + data.length : data.length,
            );
          }

          if (data.length < itemsPerLoad) {
            setHasMoreNotifications(false);
          }
        } else {
          setHasMoreNotifications(false);
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchNotifications:", error);
        setHasMoreNotifications(false);
        setNotificationCount(0);
      } finally {
        if (!append) {
          setIsLoadingInitial(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [user.userId, itemsPerLoad], // Dependencies for useCallback
  );

  // You might want to debounce this if the inputs (unreadOnly) can change rapidly
  const debouncedFetchNotifications = useCallback(
    (currentOffset: number, append: boolean, filterUnreadOnly: boolean) => {
      // Small delay to prevent rapid re-fetches
      const timer = setTimeout(() => {
        void fetchNotifications(currentOffset, append, filterUnreadOnly);
      }, 100);
      return () => clearTimeout(timer);
    },
    [fetchNotifications],
  );

  const updateSingleNotificationViewStatus = useCallback(
    (id: string, isViewed: string) => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.source_id === id
            ? { ...n, viewed: isViewed } // Update the viewed status
            : n,
        ),
      );
      // Also update the unread count locally for instant feedback
      setUnreadCount((prevCount) =>
        isViewed ? Math.max(0, prevCount - 1) : prevCount + 1,
      );
    },
    [], // No dependencies needed for this callback
  );

  // Effect to trigger initial fetch or reset when relevant dependencies change
  useEffect(() => {
    // Reset Infinite Scroll state and trigger initial fetch
    setIsLoadingInitial(true);
    setNotifications([]);
    setOffset(0);
    setHasMoreNotifications(true);
    setNotificationCount(0);

    debouncedFetchNotifications(0, false, unreadOnly);
  }, [user.userId, unreadOnly, debouncedFetchNotifications]); // Dependencies: user changes, unreadOnly filter changes

  // Function for InfiniteScroll's 'next' prop
  const loadMoreNotifications = () => {
    if (!isLoadingMore && hasMoreNotifications && !isLoadingInitial) {
      void debouncedFetchNotifications(offset, true, unreadOnly);
    }
  };

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
        isLoadingInitial,
        isLoadingMore,
        hasMoreNotifications,
        loadMoreNotifications,
        inboxScrollableRef, // Provide the ref through context
        updateSingleNotificationViewStatus,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInboxContext = () => {
  return useContext(InboxContext);
};
