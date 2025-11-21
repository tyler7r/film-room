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
import { type NewTagType as NewCollectionType } from "~/utils/types"; // Renaming NewTagType for context
import { type CreateNewCollectionType } from "../create-play";

// Define props for collections
type AddCollectionsProps = {
  collections: CreateNewCollectionType[];
  setCollections: (collections: CreateNewCollectionType[]) => void;
  searchCollections: (query: string) => Promise<CreateNewCollectionType[]>;
};

const filter = createFilterOptions<CreateNewCollectionType>();

const AddCollectionsToPlay = ({
  collections,
  setCollections,
  searchCollections,
}: AddCollectionsProps) => {
  const { affiliations, user } = useAuthContext();

  // Autocomplete & Search State
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<CreateNewCollectionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Modal & Creation State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isValidNewCollection, setIsValidNewCollection] =
    useState<boolean>(false);
  const [newCollection, setNewCollection] = useState<NewCollectionType>({
    title: "",
    private: false,
    exclusive_to: "public",
  });

  // --- ASYNC SEARCH LOGIC ---
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchCollections(query);
      setOptions(results);
    } catch (error) {
      console.error("Error searching collections:", error);
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

  // --- CREATION & SELECTION LOGIC ---
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewCollection({
      title: "",
      private: false,
      exclusive_to: "public",
    });
  };

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: (string | CreateNewCollectionType)[],
    reason: AutocompleteChangeReason,
    details: AutocompleteChangeDetails<CreateNewCollectionType> | undefined,
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
      setNewCollection({
        title: details.option.title, // Pre-fill title from input
        private: false,
        exclusive_to: "public",
      });
    } else if (reason === "createOption") {
      const t = newValue[newValue.length - 1] as string;
      setModalOpen(true);
      setNewCollection({
        title: t,
        private: false,
        exclusive_to: "public",
      });
    } else {
      // Standard selection
      const processedCollections = newValue.map((value) => {
        if (typeof value === "string") {
          return { title: value, create: true } as CreateNewCollectionType;
        }
        return value;
      });
      setCollections(processedCollections);
    }
  };

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "public" || status === "") {
      setNewCollection({
        ...newCollection,
        private: false,
        exclusive_to: "public",
      });
    } else {
      setNewCollection({
        ...newCollection,
        private: true,
        exclusive_to: status,
      });
    }
  };

  const handleNewCollectionSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user.userId) return;

    // Check for duplicates before attempting to save
    if (
      collections.some(
        (col) => col.title.toLowerCase() === newCollection.title.toLowerCase(),
      )
    ) {
      console.warn(`Collection "${newCollection.title}" is already selected.`);
      handleCloseModal();
      return;
    }

    const { data } = await supabase
      .from("collections") // <-- UPDATED TO 'collections' TABLE
      .insert({
        title: newCollection.title,
        private: newCollection.private,
        exclusive_to: newCollection.private ? newCollection.exclusive_to : null,
        author_id: user.userId,
      })
      .select("title, id, private, exclusive_to")
      .single();

    if (data) {
      // Add the newly created collection directly to the selected collections list
      setCollections([...collections, data]);
      handleCloseModal();
      // Optional: Clear input value after creation
      setInputValue("");
    }
  };

  useEffect(() => {
    setIsValidNewCollection(newCollection.title !== "");
  }, [newCollection.title]);

  const noOptionsText =
    inputValue.length < 2
      ? "Type at least 2 characters to search..."
      : "No collections found";

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        placeholder="Type at least 2 characters to search..."
        multiple
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={collections}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        filterSelectedOptions
        // FIX 1: Provide explicit comparison logic to prevent duplicates
        isOptionEqualToValue={(option, value) => {
          if (option.id && value.id) {
            return option.id === value.id;
          }
          // Fallback for unsaved/new collection objects
          return option.title === value.title;
        }}
        // FIX 2: Check against the selected `collections` array to prevent showing 'Add' for duplicates
        filterOptions={(options, params): CreateNewCollectionType[] => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          const lowerCaseInput = inputValue.toLowerCase();

          // 1. Check if an exact title exists in the current search results (options)
          const isExisting = options.some(
            (option) => lowerCaseInput === option.title.toLowerCase(),
          );

          // 2. Check if the collection is ALREADY SELECTED (in the `collections` state)
          const isAlreadySelected = collections.some(
            (col) => col.title.toLowerCase() === lowerCaseInput,
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
            <li key={option.id ?? option.title} {...otherProps}>
              <Box>
                {option.create ? (
                  <Typography variant="body2" color="primary">
                    {option.label ?? `Add "${option.title}"`}
                  </Typography>
                ) : (
                  <Typography variant="body2" component={"div"}>
                    {option.title}
                    {
                      <Typography
                        color={"textSecondary"}
                        variant="subtitle2"
                        sx={{ fontSize: 11 }}
                      >
                        {option.team
                          ? `Private to ${option.team.full_name}`
                          : `Public Collection`}
                      </Typography>
                    }
                  </Typography>
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
            label="Play Collections" // <-- UPDATED LABEL
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

      {/* CREATE COLLECTION MODAL */}
      <ModalSkeleton
        title="Create Collection" // <-- UPDATED TITLE
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        handleClose={handleCloseModal}
      >
        <Box
          component="form"
          onSubmit={handleNewCollectionSubmit}
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
              name="collection-title"
              autoFocus
              required
              margin="dense"
              id="title"
              value={newCollection.title}
              onChange={(event) =>
                setNewCollection({
                  ...newCollection,
                  title: event.target.value,
                })
              }
              label="Collection Title" // <-- UPDATED LABEL
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
                  value={newCollection.exclusive_to}
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
                      <Typography variant="caption">Private to: </Typography>
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
                    "Private collections are only viewable by your teammates and coaches, even on public plays. Public collections are viewable by all users." // <-- UPDATED TOOLTIP
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
            isValid={isValidNewCollection}
            handleCancel={handleCloseModal}
            submitTitle="SUBMIT"
          />
        </Box>
      </ModalSkeleton>
    </Box>
  );
};

export default AddCollectionsToPlay;
