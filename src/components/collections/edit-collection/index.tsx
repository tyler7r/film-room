import { Box, TextField } from "@mui/material"; // Added Box, Typography for consistent styling
import { useCallback, useEffect, useState } from "react"; // Added useCallback
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
  setIsEditOpen, // setReload, // Uncomment if you add this prop
}: EditCollectionProps) => {
  const { user } = useAuthContext();

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

  // Removed handleOpen as the modal is now opened by the parent component

  const handleClose = useCallback(() => {
    setIsEditOpen(false);
    // Reset form to original collection values when closing
    setNewCollection({
      title: collection.title,
      private: collection.private,
      exclusive_to: collection.exclusive_to ?? "public",
      description: collection.description ?? "",
    });
    setMessage({ text: undefined, status: "error" }); // Clear any messages
  }, [collection, setIsEditOpen]); // Dependencies for useCallback

  const checkForUnedited = useCallback(() => {
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
  }, [newCollection, collection]); // Dependencies for useCallback

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent event from bubbling up and potentially causing issues

    if (!isValidForm) {
      // Ensure form is valid before submitting
      setMessage({
        text: "Please make an edit before submitting!",
        status: "error",
      });
      return;
    }

    if (user.userId) {
      const { data, error } = await supabase
        .from("collections")
        .update({
          title: newCollection.title,
          private: newCollection.private,
          exclusive_to: newCollection.private
            ? newCollection.exclusive_to
            : null,
          author_id: user.userId, // Ensure author_id is correctly set
          description:
            newCollection.description === "" ? null : newCollection.description,
        })
        .eq("id", collection.id)
        .select()
        .single();
      if (data) {
        handleClose(); // Close modal on success
        // if (setReload) setReload(true); // Uncomment if you use setReload prop
      } else if (error) {
        console.error("Error updating collection:", error);
        setMessage({
          text: `There was an error updating the collection: ${error.message}`,
          status: "error",
        });
      }
    } else {
      setMessage({
        text: "You must be logged in to edit a collection.",
        status: "error",
      });
    }
  };

  // Effect to validate form and update message
  useEffect(() => {
    const isUnedited = checkForUnedited();
    if (newCollection.title.trim() === "") {
      // Trim to handle empty spaces
      setIsValidForm(false);
      setMessage({
        text: "Collection title cannot be empty.",
        status: "error",
      });
    } else if (isUnedited) {
      setIsValidForm(false);
      setMessage({
        text: "Please make an edit before submitting!",
        status: "error",
      });
    } else {
      setIsValidForm(true);
      setMessage({ text: undefined, status: "error" });
    }
  }, [newCollection, checkForUnedited]);

  // If the modal is not open, render null.
  // This component will ONLY render its modal content when 'isEditOpen' is true.
  if (!isEditOpen) {
    return null;
  }

  // Otherwise (if isEditOpen is true), render the ModalSkeleton.
  return (
    <ModalSkeleton
      isOpen={isEditOpen}
      setIsOpen={setIsEditOpen} // Pass setIsEditOpen directly to ModalSkeleton
      handleClose={handleClose}
      title="Edit Collection"
    >
      <Box
        component="form" // Use Box as a form element for consistent styling
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: 2, // Consistent gap
          p: 2, // Consistent padding
        }}
      >
        <TextField
          name="title" // Use 'title' for consistency with NewPlayType/NewCollectionType
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
          fullWidth // Make it take full width
          size="small" // Consistent size
        />
        <TextField
          name="description" // Use 'description'
          fullWidth // Make it take full width
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
          multiline // Allow multiple lines
          rows={3} // Set initial rows
          size="small" // Consistent size
        />
        <PrivacyStatus
          newDetails={newCollection}
          setNewDetails={setNewCollection}
        />
        <FormMessage message={message} />
        <FormButtons
          isValid={isValidForm}
          handleCancel={handleClose}
          submitTitle="SUBMIT"
        />
      </Box>
    </ModalSkeleton>
  );
};

export default EditCollection;
