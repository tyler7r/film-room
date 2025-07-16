import { Box, TextField } from "@mui/material";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { type CreateNewCollectionType } from "~/components/plays/create-play";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { NewCollectionType } from "~/utils/types";
import PrivacyStatus from "./privacy-status"; // Keep PrivacyStatus import

type CreateCollectionFromPlayProps = {
  collections: CreateNewCollectionType[]; // Made non-optional based on usage
  setCollections: (collections: CreateNewCollectionType[]) => void; // Made non-optional
  open: boolean;
  setOpen: (status: boolean) => void;
  newCollection: NewCollectionType;
  setNewCollection: Dispatch<SetStateAction<NewCollectionType>>;
  refetchCollections: () => void; // New prop for refetching in parent
};

const CreateCollectionFromPlay = ({
  collections,
  setCollections,
  open,
  setOpen,
  newCollection,
  setNewCollection,
  refetchCollections, // Destructure new prop
}: CreateCollectionFromPlayProps) => {
  const { user } = useAuthContext();

  const [isValidNewCol, setIsValidNewCol] = useState<boolean>(false);

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
        refetchCollections();
      }
    }
  };

  useEffect(() => {
    if (newCollection.title === "") setIsValidNewCol(false);
    else setIsValidNewCol(true);
  }, [newCollection.title]);

  return (
    <ModalSkeleton
      title="Create Collection"
      isOpen={open}
      setIsOpen={setOpen}
      handleClose={handleClose}
    >
      <Box
        component="form" // Use Box as a form element
        onSubmit={handleNewCollection}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 2,
          }}
        >
          <TextField
            sx={{ width: "100%" }}
            name="collection-title"
            autoFocus
            required
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
            size="small"
          />
          <TextField
            sx={{ width: "100%" }}
            name="collection-description"
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
            multiline
            rows={2}
            placeholder="Description (100 characters max.)" // Added placeholder from your query
            inputProps={{ maxLength: 100 }} // Added inputProps from your query
          />
          {/* PrivacyStatus component remains as per your instruction */}
          <PrivacyStatus
            newDetails={newCollection}
            setNewDetails={setNewCollection}
          />
        </Box>
        <FormButtons
          isValid={isValidNewCol}
          handleCancel={handleClose}
          submitTitle="ADD" // Changed submitTitle to ADD as per your query
        />
      </Box>
    </ModalSkeleton>
  );
};

export default CreateCollectionFromPlay;
