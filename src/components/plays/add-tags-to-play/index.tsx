import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Autocomplete,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Tooltip,
  createFilterOptions,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { NewTagType } from "~/utils/types";
import type { CreateNewTagType } from "../create-play";

type AddTagsToPlayProps = {
  tags: CreateNewTagType[];
  setTags: (tags: CreateNewTagType[]) => void;
  allTags: CreateNewTagType[] | null;
};

const filter = createFilterOptions<CreateNewTagType>();

const AddTagsToPlay = ({ tags, setTags, allTags }: AddTagsToPlayProps) => {
  const { affiliations } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();

  const [open, toggleOpen] = useState<boolean>(false);
  const [isValidNewTag, setIsValidNewTag] = useState<boolean>(false);

  const [newTag, setNewTag] = useState<NewTagType>({
    title: "",
    private: false,
    exclusive_to: "public",
  });

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: (string | CreateNewTagType)[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<CreateNewTagType> | undefined,
  ) => {
    event.stopPropagation();
    if (details?.option.create && reason !== "removeOption") {
      toggleOpen(true);
      setNewTag({
        title: details.option.title,
        private: false,
        exclusive_to: "public",
      });
    } else if (reason === "createOption") {
      const t = newValue[newValue.length - 1] as string;
      toggleOpen(true);
      setNewTag({
        title: t,
        private: false,
        exclusive_to: "public",
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

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setNewTag({ ...newTag, private: false, exclusive_to: "public" });
    } else {
      setNewTag({ ...newTag, private: true, exclusive_to: status });
    }
  };

  const handleClose = () => {
    toggleOpen(false);
    setNewTag({
      title: "",
      private: false,
      exclusive_to: "public",
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
        exclusive_to: newTag.private ? newTag.exclusive_to : null,
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
            filterOptions={(options, params): CreateNewTagType[] => {
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
              <li key={option.title + `${Math.random() * 1000}`} {...props}>
                {option.create ? option.label : option.title}
              </li>
            )}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Play Tags"
                id="play-tags"
                name="play-tags"
              />
            )}
          />
          <Modal open={open} onClose={handleClose}>
            <Box
              className="border-1 relative inset-1/2 flex w-3/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid p-4"
              sx={backgroundStyle}
            >
              <form onSubmit={handleNewTag} className="w-full">
                <DialogTitle>Add a new tag</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please add the tag that we're missing!
                  </DialogContentText>
                  <div className="flex w-full flex-col gap-6">
                    <TextField
                      name="tag-title"
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
                      label="Tag Title"
                      type="text"
                      variant="standard"
                    />
                    <FormControl>
                      <div className="flex w-full items-center justify-center gap-2">
                        <InputLabel>Privacy Status</InputLabel>
                        <Select
                          value={newTag.exclusive_to}
                          onChange={handlePrivacyStatus}
                          label="Privacy Status"
                          name="privacy"
                          id="privacy-status"
                          className="w-full"
                        >
                          <MenuItem value="public">Public</MenuItem>
                          {affiliations?.map((aff) => (
                            <MenuItem key={aff.team.id} value={aff.team.id}>
                              <div className="flex gap-2">
                                <div>
                                  Private to:{" "}
                                  <strong className="tracking-tight">
                                    {aff.team.full_name}
                                  </strong>
                                </div>
                                {aff.team.logo && (
                                  <TeamLogo tm={aff.team} size={25} />
                                )}
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                        <Tooltip
                          title={
                            "Private tags are only viewable by your teammates and coaches, even on public plays. Public tags are viewable by all users."
                          }
                          slotProps={{
                            popper: {
                              modifiers: [
                                {
                                  name: "offset",
                                  options: {
                                    offset: [0, -14],
                                  },
                                },
                              ],
                            },
                          }}
                        >
                          <IconButton size="small">
                            <InfoOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </FormControl>
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={!isValidNewTag}>
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

export default AddTagsToPlay;
