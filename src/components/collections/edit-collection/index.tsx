import { TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type {
  CollectionType,
  MessageType,
  NewCollectionType,
} from "~/utils/types";
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
    <div className="text-sm font-bold tracking-tight" onClick={handleOpen}>
      EDIT COLLECTION
    </div>
  ) : (
    <ModalSkeleton
      isOpen={isEditOpen}
      setIsOpen={setIsEditOpen}
      handleClose={handleClose}
      title="Edit Collection"
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
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
        </div>
        <FormMessage message={message} />
        <FormButtons
          isValid={isValidForm}
          handleCancel={handleClose}
          submitTitle="SUBMIT"
        />
      </form>
    </ModalSkeleton>
  );
};

export default EditCollection;
