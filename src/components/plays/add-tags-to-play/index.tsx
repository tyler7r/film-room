import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Autocomplete,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip, // Import Box
  Typography,
  createFilterOptions,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";
import TeamLogo from "~/components/teams/team-logo";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { NewTagType } from "~/utils/types";
import type { CreateNewTagType } from "../create-play";

type AddTagsToPlayProps = {
  tags: CreateNewTagType[];
  setTags: (tags: CreateNewTagType[]) => void;
  allTags: CreateNewTagType[] | null;
  refetchTags: () => void; // New prop for refetching tags in parent
};

const filter = createFilterOptions<CreateNewTagType>();

const AddTagsToPlay = ({
  tags,
  setTags,
  allTags,
  refetchTags,
}: AddTagsToPlayProps) => {
  const { affiliations } = useAuthContext();

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
    if (data) {
      setTags([...tags, data]);
      refetchTags(); // <--- Call refetchTags after successful creation
    }
  };

  useEffect(() => {
    if (newTag.title === "") setIsValidNewTag(false);
    else setIsValidNewTag(true);
  }, [newTag.title]); // Added dependency to useEffect

  return (
    <Box sx={{ width: "100%" }}>
      {" "}
      {/* Replaced div with Box */}
      {allTags && (
        <Box>
          {" "}
          {/* Replaced div with Box */}
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
            size="small"
          />
          <ModalSkeleton
            title="Create Tag"
            isOpen={open}
            setIsOpen={toggleOpen}
            handleClose={handleClose}
          >
            <Box
              component="form" // Use Box as a form element
              onSubmit={handleNewTag}
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  p: 2,
                }}
              >
                <TextField
                  sx={{ width: "100%" }} // Equivalent to w-full
                  name="tag-title"
                  autoFocus
                  required
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
                  size="small"
                />
                <FormControl sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <InputLabel>Privacy Status</InputLabel>
                    <Select
                      value={newTag.exclusive_to}
                      onChange={handlePrivacyStatus}
                      label="Privacy Status"
                      name="privacy"
                      id="privacy-status"
                      sx={{ width: "100%" }} // Equivalent to w-full
                      size="small"
                    >
                      <MenuItem value="public">
                        <Typography variant="body2" sx={{ fontSize: "14px" }}>
                          Public
                        </Typography>
                      </MenuItem>
                      {affiliations?.map((aff) => (
                        <MenuItem key={aff.team.id} value={aff.team.id}>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            {" "}
                            {/* Replaced div with Box */}
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "14px" }}
                            >
                              Private to:{" "}
                              <Typography
                                component="strong"
                                sx={{
                                  fontWeight: "bold",
                                  letterSpacing: "-0.025em",
                                }}
                              >
                                {aff.team.full_name}
                              </Typography>
                            </Typography>
                            <TeamLogo tm={aff.team} size={25} />
                          </Box>
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
                  </Box>
                </FormControl>
              </Box>
              <FormButtons
                isValid={isValidNewTag}
                handleCancel={handleClose}
                submitTitle="SUBMIT"
              />
            </Box>
          </ModalSkeleton>
        </Box>
      )}
    </Box>
  );
};

export default AddTagsToPlay;
