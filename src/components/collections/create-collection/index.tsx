import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Modal,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MessageType, NewCollectionType } from "~/utils/types";
import PageTitle from "../../utils/page-title";
import PrivacyStatus from "./privacy-status";

type CreateCollectionProps = {
  small?: boolean;
};

const CreateCollection = ({ small }: CreateCollectionProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
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

  const handleOpen = () => {
    if (user.userId) setIsOpen(true);
    else void router.push("/login");
  };

  const handleClose = () => {
    setIsOpen(false);
    setNewCollection({
      title: "",
      private: false,
      exclusive_to: "public",
      description: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
            newCollection.description === "" ? null : newCollection.description,
        })
        .select("title, id")
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
    if (newCollection.title === "") setIsValidForm(false);
    else setIsValidForm(true);
  });

  return !isOpen ? (
    <Button
      onClick={handleOpen}
      variant="contained"
      size={small ? "medium" : "large"}
      endIcon={<AddIcon />}
    >
      Create New Collection
    </Button>
  ) : (
    <Modal open={isOpen} onClose={handleClose}>
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
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidForm} size="large">
              Add
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateCollection;
