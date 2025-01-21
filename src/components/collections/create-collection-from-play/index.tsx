import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { NewCollectionType } from "~/utils/types";
import type { CreateNewCollectionType } from "../../plays/create-play";
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
    <ModalSkeleton
      isOpen={open}
      setIsOpen={setOpen}
      handleClose={handleClose}
      title="Create Collection"
    >
      <form
        onSubmit={handleNewCollection}
        className="flex w-full flex-col gap-2"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
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
            required
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
        <FormButtons
          handleCancel={handleClose}
          submitTitle="ADD"
          isValid={isValidNewCollection}
        />
      </form>
    </ModalSkeleton>
  );
};

export default CreateCollectionFromPlay;
