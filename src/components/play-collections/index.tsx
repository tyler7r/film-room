import {
  Autocomplete,
  TextField,
  createFilterOptions,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
} from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import type { NewCollectionType } from "~/utils/types";
import AddCollection from "../add-collection";
import type { CreateNewCollectionType } from "../add-play";
import Collection from "../collection";

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
  const [open, setOpen] = useState<boolean>(false);

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
      setOpen(true);
      setNewCollection({
        title: details.option.title,
        private: false,
        exclusive_to: "public",
      });
    } else if (reason === "createOption") {
      const t = newValue[newValue.length - 1] as string;
      setOpen(true);
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
              <li key={option.id} {...props}>
                {option.title && option.collection && option.profile && (
                  <Collection
                    collection={{
                      collection: option.collection,
                      profile: option.profile,
                      team: option.team ? option.team : null,
                    }}
                    listItem={true}
                    small={true}
                  />
                )}
                {option.create && option.label}
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
          <AddCollection
            collections={collections}
            setCollections={setCollections}
            open={open}
            setOpen={setOpen}
            newCollection={newCollection}
            setNewCollection={setNewCollection}
          />
        </div>
      )}
    </div>
  );
};

export default PlayCollections;
