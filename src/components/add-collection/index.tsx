import {
  Autocomplete,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  TextField,
  createFilterOptions,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
} from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { NewCollectionType } from "~/utils/types";
import type { CreateNewTagType as CreateNewCollectionType } from "../add-play";
import PrivacyStatus from "./privacy-status";

type PlayCollectionsProps = {
  collections: CreateNewCollectionType[];
  setCollections: (tags: CreateNewCollectionType[]) => void;
  allCollections: CreateNewCollectionType[] | null;
};

const filter = createFilterOptions<CreateNewCollectionType>();

const PlayCollections = ({
  collections,
  setCollections,
  allCollections,
}: PlayCollectionsProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();

  const [open, toggleOpen] = useState<boolean>(false);
  const [isValidNewCollection, setIsValidNewCollection] =
    useState<boolean>(false);

  const [newCollection, setNewCollection] = useState<NewCollectionType>({
    title: "",
    private: false,
    exclusive_to: "public",
  });

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: (string | CreateNewCollectionType)[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<CreateNewCollectionType> | undefined,
  ) => {
    event.stopPropagation();
    if (details?.option.create && reason !== "removeOption") {
      toggleOpen(true);
      setNewCollection({
        title: details.option.title,
        private: false,
        exclusive_to: "public",
      });
    } else if (reason === "createOption") {
      const t = newValue[newValue.length - 1] as string;
      toggleOpen(true);
      setNewCollection({
        title: t,
        private: false,
        exclusive_to: "public",
      });
    } else {
      setCollections(
        newValue.map((value) => {
          if (typeof value === "string") {
            return {
              title: value,
              create: true,
            };
          } else {
            return value;
          }
        }),
      );
    }
  };

  const handleClose = () => {
    toggleOpen(false);
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
      if (data) setCollections([...collections, data]);
    }
  };

  useEffect(() => {
    if (newCollection.title === "") setIsValidNewCollection(false);
    else setIsValidNewCollection(true);
  });

  return (
    <div className="w-full">
      {allCollections && (
        <div>
          <Autocomplete
            value={collections}
            multiple
            onChange={(event, newValue, reason, details) => {
              handleChange(event, newValue, reason, details);
            }}
            filterSelectedOptions
            filterOptions={(options, params): CreateNewCollectionType[] => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue === option.title,
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push({
                  title: inputValue,
                  label: `Add "${inputValue}"`,
                  create: true,
                });
              }
              return filtered;
            }}
            options={allCollections}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                return option;
              }
              if (option.label) {
                return option.title;
              }
              return option.title;
            }}
            renderOption={(props, option) => (
              <li key={option.title + `${Math.random() * 1000}`} {...props}>
                {option.create ? option.label : option.title}
              </li>
            )}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Play Collections"
                id="play-collections"
                name="play-collections"
              />
            )}
          />
          <Modal open={open} onClose={handleClose}>
            <Box
              className="border-1 relative inset-1/2 flex w-3/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid p-4"
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
        </div>
      )}
    </div>
  );
};

export default PlayCollections;
