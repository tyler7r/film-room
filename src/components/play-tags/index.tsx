import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { TagType } from "../play-modal";

type NewTagType = {
  title: string;
  exclusive_to?: string | null;
  private: boolean;
  inputValue?: string;
};

type PlayTagsProps = {
  tags: TagType[];
  setTags: (tags: TagType[]) => void;
  allTags: TagType[] | null;
};

const filter = createFilterOptions<TagType>();

const PlayTags = ({ tags, setTags, allTags }: PlayTagsProps) => {
  const { user } = useAuthContext();
  const [open, toggleOpen] = useState<boolean>(false);
  const [isValidNewTag, setIsValidNewTag] = useState<boolean>(false);

  const [newTag, setNewTag] = useState<NewTagType>({
    title: "",
    private: false,
    exclusive_to: null,
  });

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: (string | TagType)[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<TagType> | undefined,
  ) => {
    event.stopPropagation();
    if (details?.option.create && reason !== "removeOption") {
      toggleOpen(true);
      setNewTag({
        title: details.option.title,
        private: false,
      });
    } else if (reason === "createOption") {
      toggleOpen(true);
      setNewTag({
        title: `${details?.option}`,
        private: false,
      });
    } else {
      setTags(
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
    setNewTag({
      title: "",
      private: false,
      exclusive_to: null,
    });
  };

  const handleNewTag = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleClose();
    const { data } = await supabase
      .from("tags")
      .insert({
        title: newTag.title,
        private: newTag.private,
        exclusive_to: newTag.private
          ? `${user.currentAffiliation?.team.id}`
          : null,
      })
      .select("title, id")
      .single();
    if (data) setTags([...tags, data]);
  };

  useEffect(() => {
    if (newTag.title === "") setIsValidNewTag(false);
    else setIsValidNewTag(true);
  });

  return (
    <div className="w-full">
      {allTags && (
        <div>
          <Autocomplete
            value={tags}
            multiple
            onChange={(event, newValue, reason, details) => {
              handleChange(event, newValue, reason, details);
            }}
            filterSelectedOptions
            filterOptions={(options, params): TagType[] => {
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
            options={allTags}
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
              <li {...props}>{option.create ? option.label : option.title}</li>
            )}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Play Tags" />
            )}
          />
          <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleNewTag}>
              <DialogTitle>Add a new tag</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Please add the tag that we're missing!
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="title"
                  value={newTag.title}
                  onChange={(event) =>
                    setNewTag({
                      ...newTag,
                      title: event.target.value,
                    })
                  }
                  label="Title"
                  type="text"
                  variant="standard"
                />
                {user.currentAffiliation?.team.id && (
                  <div className="flex items-center justify-center">
                    <div className="text-lg font-bold tracking-tight">
                      Keep this tag private to{" "}
                      {`${user.currentAffiliation?.team.full_name} `}
                    </div>
                    <Checkbox
                      checked={newTag.private}
                      onChange={() => {
                        setNewTag({
                          ...newTag,
                          private: !newTag.private,
                        });
                      }}
                      size="medium"
                    />
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={!isValidNewTag}>
                  Add
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default PlayTags;
