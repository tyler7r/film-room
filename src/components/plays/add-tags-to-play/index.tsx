import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import useDebounce from "~/utils/debounce";
import { supabase } from "~/utils/supabase";
import { type NewTagType } from "~/utils/types";
import { type CreateNewTagType } from "../create-play";

type AddTagsProps = {
  tags: CreateNewTagType[];
  setTags: (tags: CreateNewTagType[]) => void;
  searchTags: (query: string) => Promise<CreateNewTagType[]>;
};

const filter = createFilterOptions<CreateNewTagType>();

const AddTagsToPlay = ({ tags, setTags, searchTags }: AddTagsProps) => {
  const { affiliations } = useAuthContext();

  // Autocomplete & Search State
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<CreateNewTagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Modal & Creation State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isValidNewTag, setIsValidNewTag] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<NewTagType>({
    title: "",
    private: false,
    exclusive_to: "public",
  });

  // --- ASYNC SEARCH LOGIC ---
  const handleSearch = async (query: string) => {
    // Note: We allow searching even with short queries if we want to support creation,
    // but typically for async we wait for 2 chars.
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchTags(query);
      setOptions(results);
    } catch (error) {
      console.error("Error searching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }
    void debouncedSearch(inputValue);
  }, [inputValue, debouncedSearch]);
  // --- END ASYNC SEARCH LOGIC ---

  // --- CREATION LOGIC ---
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewTag({
      title: "",
      private: false,
      exclusive_to: "public",
    });
  };

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: (string | CreateNewTagType)[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<CreateNewTagType> | undefined,
  ) => {
    event.stopPropagation();

    // Logic: If the user selected a "Create" option or typed a string that allows creation
    if (
      details?.option &&
      typeof details.option !== "string" &&
      details.option.create &&
      reason !== "removeOption"
    ) {
      setModalOpen(true);
      setNewTag({
        title: details.option.title, // Pre-fill title from input
        private: false,
        exclusive_to: "public",
      });
    } else if (reason === "createOption") {
      const t = newValue[newValue.length - 1] as string;
      setModalOpen(true);
      setNewTag({
        title: t,
        private: false,
        exclusive_to: "public",
      });
    } else {
      // Standard selection
      const processedTags = newValue.map((value) => {
        if (typeof value === "string") {
          return { title: value, create: true };
        }
        return value;
      });
      setTags(processedTags);
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

  const handleNewTagSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const { data } = await supabase
      .from("tags")
      .insert({
        title: newTag.title,
        private: newTag.private,
        exclusive_to: newTag.private ? newTag.exclusive_to : null,
      })
      .select("title, id, private, exclusive_to")
      .single();

    if (data) {
      // Add the newly created tag directly to the selected tags list
      setTags([...tags, data]);
      handleCloseModal();
      // Optional: Clear input value after creation
      setInputValue("");
    }
  };

  useEffect(() => {
    setIsValidNewTag(newTag.title !== "");
  }, [newTag.title]);

  const noOptionsText =
    inputValue.length < 2
      ? "Type at least 2 characters to search..."
      : "No tags found";

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        placeholder="Type at least 2 characters to search..."
        multiple
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={tags}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        isOptionEqualToValue={(option, value) => {
          if (option.id && value.id) {
            return option.id === value.id;
          }
          // Fallback for unsaved/new tag objects created for the value array
          return option.title === value.title;
        }}
        filterSelectedOptions
        // Filter Options: Adds the "Add 'xxx'" option if no exact match found
        filterOptions={(options, params): CreateNewTagType[] => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          const lowerCaseInput = inputValue.toLowerCase();

          // 1. Check if an exact title exists in the current search results (options)
          const isExisting = options.some(
            (option) => lowerCaseInput === option.title.toLowerCase(),
          );

          // 2. Check if the tag is ALREADY SELECTED (in the `tags` state)
          const isAlreadySelected = tags.some(
            (tag) => tag.title.toLowerCase() === lowerCaseInput,
          );
          if (
            inputValue !== "" &&
            !isExisting &&
            !isAlreadySelected &&
            inputValue.length >= 2
          ) {
            filtered.push({
              title: inputValue,
              label: `Add "${inputValue}"`,
              create: true,
            });
          }
          return filtered;
        }}
        getOptionLabel={(option) => {
          if (typeof option === "string") return option;
          return option.title;
        }}
        // Render Option: Handles standard options vs "Create" option styling
        renderOption={(props, option) => {
          const { ...otherProps } = props;
          return (
            <li key={option.id} {...otherProps}>
              <Box>
                {option.create ? (
                  <Typography variant="body2" color="primary">
                    {option.label ?? `Add "${option.title}"`}
                  </Typography>
                ) : (
                  <Typography variant="body2">{option.title}</Typography>
                )}
              </Box>
            </li>
          );
        }}
        options={options}
        loading={loading}
        noOptionsText={noOptionsText}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option.title}
              {...getTagProps({ index })}
              key={option.id ?? index}
              size="small"
            />
          ))
        }
      />

      {/* CREATE TAG MODAL */}
      <ModalSkeleton
        title="Create Tag"
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        handleClose={handleCloseModal}
      >
        <Box
          component="form"
          onSubmit={handleNewTagSubmit}
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
              sx={{ width: "100%" }}
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
                  sx={{ width: "100%" }}
                  size="small"
                >
                  <MenuItem
                    value="public"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      // 🎯 FIX: Compressed menu item padding
                      p: 1,
                      pl: 2,
                      minHeight: "auto",
                    }}
                  >
                    <Typography variant="caption">Public</Typography>
                  </MenuItem>
                  {affiliations?.map((div) => (
                    <MenuItem
                      key={div.team.id}
                      value={div.team.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // 🎯 FIX: Compressed menu item padding
                        p: 1,
                        pl: 2,
                        minHeight: "auto",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        Plays private to:{" "}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          lineHeight: 1,
                          letterSpacing: -0.25,
                        }}
                      >
                        {div.team.full_name}
                      </Typography>
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
            handleCancel={handleCloseModal}
            submitTitle="SUBMIT"
          />
        </Box>
      </ModalSkeleton>
    </Box>
  );
};

export default AddTagsToPlay;
