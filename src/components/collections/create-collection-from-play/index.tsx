import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Modal,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { NewCollectionType } from "~/utils/types";
import type { CreateNewCollectionType } from "../../plays/create-play";
import PageTitle from "../../utils/page-title";
import PrivacyStatus from "./privacy-status";

type CreateCollectionFromPlayProps = {
  collections?: CreateNewCollectionType[];
  setCollections?: (tags: CreateNewCollectionType[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  newCollection: NewCollectionType;
  setNewCollection: (newCollection: NewCollectionType) => void;
};

const CreateCollectionFromPlay = ({
  collections,
  setCollections,
  open,
  setOpen,
  newCollection,
  setNewCollection,
}: CreateCollectionFromPlayProps) => {
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
      description: "",
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
          description:
            newCollection.description === "" ? null : newCollection.description,
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
          <PageTitle title="Add New Collection" size="small" />
          <DialogContent>
            <div className="flex w-full flex-col items-center justify-center gap-2">
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
                className="w-full"
              />
              <TextField
                name="collection-description"
                className="w-full"
                autoFocus
                margin="dense"
                id="description"
                value={newCollection.description}
                onChange={(event) =>
                  setNewCollection({
                    ...newCollection,
                    description: event.target.value,
                  })
                }
                label="Description"
                type="text"
                placeholder="Description (100 characters max.)"
                inputProps={{ maxLength: 100 }}
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

export default CreateCollectionFromPlay;
