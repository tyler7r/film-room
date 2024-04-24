import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

export type ChildrenNavProps = {
  logout: () => void;
};

export const Navbar = () => {
  const { isMobile } = useMobileContext();
  const { setUnreadCommentCount, setUnreadMentionCount, isOpen } =
    useInboxContext();
  const { user } = useAuthContext();

  const router = useRouter();

  const fetchUnreadMentions = async () => {
    const { count } = await supabase
      .from("inbox_mentions")
      .select("*", { count: "exact" })
      .match({ receiver_id: `${user.userId}`, viewed: false });
    if (count && count > 0) setUnreadMentionCount(count);
    else setUnreadMentionCount(0);
  };

  const fetchUnreadComments = async () => {
    const { count } = await supabase
      .from("comment_notifications")
      .select("*", { count: "exact" })
      .match({ play_author_id: `${user.userId}`, viewed_by_author: false });
    if (count && count > 0) setUnreadCommentCount(count);
    else setUnreadCommentCount(0);
  };

  const fetchUnreadCount = async () => {
    void fetchUnreadMentions();
    void fetchUnreadComments();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const channel = supabase
      .channel("mention_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          console.log("mentions changed");
          void fetchUnreadMentions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          console.log("comments changed");
          void fetchUnreadComments();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user.isLoggedIn) {
      void fetchUnreadCount();
    }
  }, [isOpen]);

  return isMobile ? (
    <MobileNav logout={logout} />
  ) : (
    <DesktopNav logout={logout} />
  );
};
