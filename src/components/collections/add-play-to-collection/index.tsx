import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import { Box, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { MessageType } from "~/utils/types";
import AddCollectionsToPlay from "../../plays/add-collections-to-play";
import type { CreateNewCollectionType } from "../../plays/create-play";
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
  const [collections, setCollections] = useState<
    CreateNewCollectionType[] | null
  >(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [collectionIds, setCollectionIds] = useState<string[] | null>(null);

  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });

  const fetchCollections = async () => {
    if (user.userId) {
      const collections = supabase
        .from("collection_view")
        .select("*, id:collection->>id, title:collection->>title");
      if (collectionIds) {
        void collections.not("collection->>id", "in", `(${collectionIds})`);
      }
      if (affIds && affIds.length > 0) {
        void collections.or(
          `collection->>author_id.eq.${user.userId}, collection->>exclusive_to.in.(${affIds})`,
        );
      } else {
        void collections.eq("collection->>author_id", user.userId);
      }
      const { data } = await collections;
      if (data) setCollections(data);
    }
  };

  const fetchPlayCollections = async () => {
    const { data } = await supabase
      .from("collection_plays")
      .select()
      .eq("play_id", playId);
    if (data && data.length > 0)
      setCollectionIds(data.map((col) => col.collection_id));
    else setCollectionIds(null);
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
    // handleMenuClose();
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

  useEffect(() => {
    void fetchCollections();
  }, [collectionIds]);

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
            allCollections={collections}
            refetchCollections={fetchCollections}
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
