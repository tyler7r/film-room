import { Box, Button, Modal } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType } from "~/utils/types";
import type { CreateNewCollectionType } from "../add-play";
import FormMessage from "../form-message";
import PageTitle from "../page-title";
import PlayCollections from "../play-collections";

type CollectionModalProps = {
  playId: string;
  handleMenuClose: () => void;
};

const CollectionModal = ({ playId, handleMenuClose }: CollectionModalProps) => {
  const { affIds, user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchCollections = async () => {
    if (user.userId) {
      const collections = supabase
        .from("collection_view")
        .select("*, id:collection->>id, title:collection->>title");
      if (collectionIds) {
        void collections.not("collection->>id", "in", `(${collectionIds})`);
      }
      if (affIds) {
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
    handlePopoverClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setPlayCollections([]);
    setMessage({ text: undefined, status: "error" });
    handleMenuClose();
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
    }, 1500);
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
    <div className="text-sm font-bold" onClick={handleOpen}>
      ADD TO COLLECTIONS
    </div>
  ) : (
    <Modal
      open={isOpen}
      onClose={handleClose}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-md border-solid p-4"
        sx={backgroundStyle}
      >
        <Button
          variant="text"
          size="large"
          sx={{
            position: "absolute",
            right: "0",
            top: "0",
            fontWeight: "bold",
            fontSize: "24px",
            lineHeight: "32px",
          }}
          onClick={handleClose}
        >
          X
        </Button>
        <PageTitle title="Add to Collection" size="small" />
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 p-2"
        >
          <PlayCollections
            collections={playCollections}
            setCollections={setPlayCollections}
            allCollections={collections}
          />
          <div className="flex items-center justify-center gap-4">
            <Button type="submit" variant="contained" disabled={!isValidForm}>
              Submit
            </Button>
            <Button type="button" variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </div>
          <FormMessage message={message} />
        </form>
      </Box>
    </Modal>
  );
};

export default CollectionModal;
