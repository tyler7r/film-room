import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { NewCollectionType } from "~/utils/types";
import type { CreateNewCollectionType } from "../add-play";
import PrivacyStatus from "./privacy-status";

type AddCollectionProps = {
  collections?: CreateNewCollectionType[];
  setCollections?: (tags: CreateNewCollectionType[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  newCollection: NewCollectionType;
  setNewCollection: (newCollection: NewCollectionType) => void;
};

const AddCollection = ({
  collections,
  setCollections,
  open,
  setOpen,
  newCollection,
  setNewCollection,
}: AddCollectionProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();

  const [isValidNewCollection, setIsValidNewCollection] =
    useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    setNewCollection({
      title: "",
      private: false,
      exclusive_to: "public",
    });
  };

  const handleNewCollection = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    handleClose();
    if (user.userId) {
      const { data } = await supabase
        .from("collections")
        .insert({
          title: newCollection.title,
          private: newCollection.private,
          exclusive_to: newCollection.private
            ? newCollection.exclusive_to
            : null,
          author_id: user.userId,
        })
        .select("title, id")
        .single();
      if (data && setCollections && collections) {
        setCollections([...collections, data]);
      }
    }
  };

  useEffect(() => {
    if (newCollection.title === "") setIsValidNewCollection(false);
    else setIsValidNewCollection(true);
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        className={`relative inset-1/2 flex w-3/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md p-4`}
        sx={backgroundStyle}
      >
        <form onSubmit={handleNewCollection} className="w-full">
          <DialogTitle>Add a new collection</DialogTitle>
          <DialogContent>
            <div className="flex w-full flex-col gap-4">
              <TextField
                name="collection-title"
                autoFocus
                margin="dense"
                id="title"
                value={newCollection.title}
                onChange={(event) =>
                  setNewCollection({
                    ...newCollection,
                    title: event.target.value,
                  })
                }
                label="Collection Title"
                type="text"
                variant="standard"
              />
              <PrivacyStatus
                newDetails={newCollection}
                setNewDetails={setNewCollection}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!isValidNewCollection}>
              Add
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Modal>
  );
};

export default AddCollection;
