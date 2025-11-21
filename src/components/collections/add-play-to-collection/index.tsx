import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import { Box, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import AddCollectionsToPlay from "~/components/plays/add-collections-to-play";
import { type CreateNewCollectionType } from "~/components/plays/create-play";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { MessageType } from "~/utils/types";
import FormMessage from "../../utils/form-message";

type AddPlayToCollection = {
  playId: string;
};

const AddPlayToCollection = ({ playId }: AddPlayToCollection) => {
  const { affIds, user } = useAuthContext();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [playCollections, setPlayCollections] = useState<
    CreateNewCollectionType[]
  >([]);
  // const [collections, setCollections] = useState<
  //   CreateNewCollectionType[] | null
  // >(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  // const [collectionIds, setCollectionIds] = useState<string[] | null>(null);

  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });

  const searchCollections = useCallback(
    async (query: string): Promise<CreateNewCollectionType[]> => {
      if (!user.userId || query.length < 2) return [];

      const collectionsQuery = supabase
        .from("collection_view")
        .select(
          "*, id:collection->>id, title:collection->>title, private:collection->>private, exclusive_to:collection->>exclusive_to",
        )
        .ilike("collection->>title", `%${query}%`);

      if (affIds && affIds.length > 0) {
        void collectionsQuery.or(
          `collection->>author_id.eq.${
            user.userId
          }, collection->>exclusive_to.in.(${affIds.join(",")})`,
        );
      } else {
        void collectionsQuery.eq("collection->>author_id", user.userId);
      }

      const { data } = await collectionsQuery.limit(20);
      return data ?? [];
    },
    [user.userId, affIds],
  );

  const fetchPlayCollections = async () => {
    const { data } = await supabase
      .from("collection_plays")
      .select("collections!inner(id, title)")
      .eq("play_id", playId);
    if (data && data.length > 0)
      setPlayCollections(
        data.map((col) => ({
          id: col.collections.id,
          title: col.collections.title,
        })),
      );
    else setPlayCollections([]);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.userId) {
      setIsOpen(true);
    } else void router.push("/login");
  };

  const handleClose = () => {
    setIsOpen(false);
    setPlayCollections([]);
    setMessage({ text: undefined, status: "error" });
  };

  const handleNewCollection = async (collection: string, title: string) => {
    const { error } = await supabase
      .from("collection_plays")
      .insert({
        play_id: playId,
        collection_id: collection,
      })
      .select();
    if (error?.code === "23505")
      setMessage({
        status: "error",
        text: `This play already exists in "${title}".`,
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playCollections.length > 0) {
      playCollections.forEach((col) => {
        void handleNewCollection(`${col.id}`, col.title);
      });
    }
    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  useEffect(() => {
    if (playCollections.length === 0) setIsValidForm(false);
    else setIsValidForm(true);
  }, [playCollections]);

  useEffect(() => {
    void fetchPlayCollections();
  }, []);

  return !isOpen ? (
    <Box sx={{ display: "flex", alignItems: "center" }} onClick={handleOpen}>
      <ListItemIcon sx={{ minWidth: "12px" }}>
        <CollectionsBookmarkIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={"bold"}>
            Add to Collections
          </Typography>
        }
      />
    </Box>
  ) : (
    <ModalSkeleton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleClose={handleClose}
      title="Add to Collections"
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-4 p-2">
          <AddCollectionsToPlay
            collections={playCollections}
            setCollections={setPlayCollections}
            searchCollections={searchCollections}
          />
          <FormMessage message={message} />
        </div>
        <FormButtons
          isValid={isValidForm}
          handleCancel={handleClose}
          submitTitle="SUBMIT"
        />
      </form>
    </ModalSkeleton>
  );
};

export default AddPlayToCollection;
