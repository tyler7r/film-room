import AddIcon from "@mui/icons-material/Add";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { MessageType, NewCollectionType } from "~/utils/types";
import PrivacyStatus from "./privacy-status";

type CreateCollectionProps = {
  small?: boolean;
};

const CreateCollection = ({ small }: CreateCollectionProps) => {
  const { user } = useAuthContext();
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
      sx={{ fontWeight: "bold" }}
    >
      Create New Collection
    </Button>
  ) : (
    <ModalSkeleton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Create Collection"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-2"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
          <TextField
            name="collection-title"
            autoFocus
            margin="dense"
            id="title"
            required
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
          <FormMessage message={message} />
        </div>
        <FormButtons
          handleCancel={handleClose}
          submitTitle="SUBMIT"
          isValid={isValidForm}
        />
      </form>
    </ModalSkeleton>
  );
};

export default CreateCollection;
