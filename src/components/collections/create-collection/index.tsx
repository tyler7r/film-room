// components/collections/create-collection/index.tsx (REFINED)

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { MessageType, NewCollectionType } from "~/utils/types";
import PrivacyStatus from "./privacy-status";

type CreateCollectionProps = {
  small?: boolean; // Keep if you still use a 'small' button variant
  icon?: boolean; // Keep if you still use an 'icon' button variant
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  standaloneTrigger?: boolean; // New prop for standalone trigger
};

export interface CreateCollectionRef {
  openModal: () => void;
}

const CreateCollection = forwardRef<CreateCollectionRef, CreateCollectionProps>(
  ({ small, icon, isOpen, setIsOpen, standaloneTrigger = false }, ref) => {
    const { user } = useAuthContext();
    const router = useRouter();

    const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
    const activeIsOpen = isOpen ?? internalIsOpen;
    const setActiveIsOpen = setIsOpen ?? setInternalIsOpen;

    const [newCollection, setNewCollection] = useState<NewCollectionType>({
      title: "",
      description: "",
      exclusive_to: "public",
      private: false,
    });
    const [isValidForm, setIsValidForm] = useState<boolean>(false);
    const [message, setMessage] = useState<MessageType>({
      text: undefined,
      status: "error",
    });

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setActiveIsOpen(true);
      },
    }));

    const handleOpenModalTrigger = () => {
      if (user.userId) setActiveIsOpen(true);
      else void router.push("/login");
    };

    const handleClose = () => {
      setActiveIsOpen(false);
      setNewCollection({
        title: "",
        private: false,
        exclusive_to: "public",
        description: "",
      });
      setMessage({ text: undefined, status: "error" });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isValidForm) {
        setMessage({ text: "Please enter a valid title.", status: "error" });
        return;
      }

      if (user.userId) {
        const { data, error } = await supabase
          .from("collections")
          .insert({
            title: newCollection.title,
            private: newCollection.private,
            exclusive_to: newCollection.private
              ? newCollection.exclusive_to
              : null,
            author_id: user.userId,
            description:
              newCollection.description === ""
                ? null
                : newCollection.description,
          })
          .select("title, id")
          .single();
        if (data) {
          handleClose();
          void router.push(`/collections/${data.id}`);
        } else if (error)
          setMessage({
            text: `There was an error creating the collection: ${error.message}`,
            status: "error",
          });
      }
    };

    useEffect(() => {
      if (newCollection.title === "") {
        setIsValidForm(false);
      } else {
        setIsValidForm(true);
        setMessage({ text: undefined, status: "error" });
      }
    }, [newCollection.title]);

    // Render nothing if the modal is not open AND it's not a standalone trigger
    if (!activeIsOpen && !standaloneTrigger) {
      return null;
    }

    // Render the standalone button/icon if it's a standaloneTrigger AND the modal is not open
    if (standaloneTrigger && !activeIsOpen) {
      return icon ? (
        <IconButton
          onClick={handleOpenModalTrigger}
          size={"small"}
          sx={{ padding: 0 }}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      ) : (
        <Button
          onClick={handleOpenModalTrigger}
          variant="contained"
          size={small ? "medium" : "large"}
          endIcon={<AddIcon />}
          sx={{ fontWeight: "bold", textTransform: "none" }}
        >
          Create New Collection
        </Button>
      );
    }

    // Otherwise, render the ModalSkeleton (meaning activeIsOpen is true)
    return (
      <ModalSkeleton
        isOpen={activeIsOpen}
        setIsOpen={setActiveIsOpen}
        handleClose={handleClose}
        title="Create Collection"
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", sm: "80%" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              p: 2,
            }}
          >
            <TextField
              sx={{ width: "100%" }}
              name="collection-title"
              margin="dense"
              id="title"
              required
              value={newCollection.title}
              onChange={(event) =>
                setNewCollection((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
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
                setNewCollection((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              label="Description"
              type="text"
              placeholder="Description (100 characters max.)"
              inputProps={{ maxLength: 100 }}
              multiline
              rows={2}
              size="small"
            />
            <PrivacyStatus
              newDetails={newCollection}
              setNewDetails={setNewCollection}
            />
          </Box>
          <FormMessage message={message} />
          <FormButtons
            handleCancel={handleClose}
            submitTitle="SUBMIT"
            isValid={isValidForm}
          />
        </Box>
      </ModalSkeleton>
    );
  },
);

CreateCollection.displayName = "CreateCollection";

export default CreateCollection;
