import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type {
  CollectionType,
  MessageType,
  NewCollectionType,
} from "~/utils/types";
import PageTitle from "../../utils/page-title";
import PrivacyStatus from "../create-collection/privacy-status";

type EditCollectionProps = {
  collection: CollectionType;
  isEditOpen: boolean;
  setIsEditOpen: (isEditOpen: boolean) => void;
};

const EditCollection = ({
  collection,
  isEditOpen,
  setIsEditOpen,
}: EditCollectionProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [newCollection, setNewCollection] = useState<NewCollectionType>({
    title: collection.title,
    description: collection.description ?? "",
    exclusive_to: collection.exclusive_to ?? "public",
    private: collection.private,
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });

  const handleOpen = () => {
    if (user.userId) setIsEditOpen(true);
    else void router.push("/login");
  };

  const handleClose = () => {
    setIsEditOpen(false);
    setNewCollection({
      title: collection.title,
      private: collection.private,
      exclusive_to: collection.exclusive_to ?? "public",
      description: collection.description ?? "",
    });
  };

  const checkForUnedited = () => {
    const description =
      newCollection.description === "" ? null : newCollection.description;
    const exclusive =
      newCollection.exclusive_to === "public"
        ? null
        : newCollection.exclusive_to;

    if (
      newCollection.title === collection.title &&
      description === collection.description &&
      exclusive === collection.exclusive_to &&
      newCollection.private === collection.private
    ) {
      return true;
    } else return false;
  };

  const updateMessage = () => {
    const isUnedited = checkForUnedited();
    if (newCollection.title === "") {
      setMessage({ text: "Please enter a title!", status: "error" });
    } else if (isUnedited) {
      setMessage({
        text: "Please make a change to submit collection edit.",
        status: "error",
      });
    } else {
      setMessage({ text: undefined, status: "error" });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (user.userId) {
      const { data, error } = await supabase
        .from("collections")
        .update({
          title: newCollection.title,
          private: newCollection.private,
          exclusive_to: newCollection.private
            ? newCollection.exclusive_to
            : null,
          author_id: user.userId,
          description:
            newCollection.description === "" ? null : newCollection.description,
        })
        .eq("id", collection.id)
        .select()
        .single();
      if (data) {
        handleClose();
        setMessage({ text: undefined, status: "error" });
      } else if (error)
        setMessage({
          text: `There was an error creating the collection: ${error.message}`,
          status: "error",
        });
    }
  };

  useEffect(() => {
    const isUnedited = checkForUnedited();
    if (newCollection.title === "" || isUnedited) setIsValidForm(false);
    else setIsValidForm(true);
  }, [newCollection]);

  return !isEditOpen ? (
    <IconButton onClick={handleOpen} size="small">
      <EditIcon color="action" />
    </IconButton>
  ) : (
    <Modal open={isEditOpen} onClose={handleClose}>
      <Box
        className={`relative inset-1/2 flex w-3/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md p-4`}
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
        <form onSubmit={handleSubmit} className="w-full">
          <PageTitle title="Add New Collection" size="small" />
          <DialogContent>
            <div className="flex w-full flex-col items-center justify-center">
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
            <FormMessage message={message} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} size="large" variant="outlined">
              Cancel
            </Button>
            {isValidForm ? (
              <Button variant="contained" size="large" type="submit">
                Edit Collection
              </Button>
            ) : (
              <Button
                size="large"
                variant="outlined"
                color="primary"
                type="button"
                onClick={() => updateMessage()}
              >
                Edit Collection
              </Button>
            )}
          </DialogActions>
        </form>
      </Box>
    </Modal>
  );
};

export default EditCollection;
