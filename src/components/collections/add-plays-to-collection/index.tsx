import StarIcon from "@mui/icons-material/Star";
import {
  Autocomplete,
  Box,
  CircularProgress, // Import CircularProgress for loading indicator
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import TeamLogo from "~/components/teams/team-logo";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MessageType, PlayPreviewType } from "~/utils/types";

// Debounce utility function outside the component
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
) => {
  let timeout: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

type PlaysToCollectionModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  collectionId: string;
  setReload: (reload: boolean) => void;
  playIds: string[] | null;
};

const PlaysToCollectionModal = ({
  isOpen,
  setIsOpen,
  collectionId,
  setReload,
  playIds,
}: PlaysToCollectionModalProps) => {
  const { user, affIds } = useAuthContext();

  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const [plays, setPlays] = useState<PlayPreviewType[]>([]); // Initialize as empty array
  const [addedPlays, setAddedPlays] = useState<PlayPreviewType[] | null>(null);

  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessage({ text: undefined, status: "error" });
    setAddedPlays(null); // Clear selected plays on close
    setPlays([]); // Clear search results on close
    setSearchTerm(""); // Reset search term
  }, [setIsOpen]);

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: PlayPreviewType[],
  ) => {
    if (newValue.length > 0) {
      setAddedPlays(newValue);
    } else {
      setAddedPlays(null);
    }
  };

  const fetchPlays = useCallback(
    async (currentSearchTerm?: string) => {
      // Ensure user is logged in to fetch private plays relevant to them
      if (!user.userId) {
        setPlays([]);
        return;
      }

      setSearchLoading(true);
      setMessage({ text: undefined, status: "error" }); // Clear previous messages

      let playsQuery = supabase
        .from("play_preview")
        .select("*")
        .order("play->>created_at", { ascending: false });

      // Exclude plays already in the collection
      if (playIds && playIds.length > 0) {
        playsQuery = playsQuery.not("play->>id", "in", `(${playIds})`);
      }

      // Filter by privacy and affiliation
      if (affIds && affIds.length > 0) {
        playsQuery = playsQuery.or(
          `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
        );
      } else {
        playsQuery = playsQuery.eq("play->>private", false);
      }

      // Apply search term if provided
      if (currentSearchTerm && currentSearchTerm.trim() !== "") {
        const searchLike = `%${currentSearchTerm.trim()}%`;
        playsQuery = playsQuery.or(
          `play->>title.ilike.${searchLike},video->>title.ilike.${searchLike},author->>name.ilike.${searchLike}`,
        );
      } else {
        // Initial load or no search term: limit to a few recent plays
        playsQuery = playsQuery.limit(10); // Initial load limit
      }

      const { data, error } = await playsQuery;

      if (error) {
        console.error("Error fetching plays for collection modal:", error);
        setMessage({ text: "Error loading plays.", status: "error" });
        setPlays([]);
      } else if (data) {
        setPlays(data);
      } else {
        setPlays([]);
      }
      setSearchLoading(false);
    },
    [playIds, affIds, user.userId],
  );

  // Debounced function for handling input change
  const debouncedFetchPlays = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      void fetchPlays(value);
    }, 300), // 300ms debounce
    [fetchPlays],
  );

  const handleNewPlay = async (playId: string) => {
    const { error } = await supabase.from("collection_plays").insert({
      collection_id: collectionId,
      play_id: playId,
    });
    if (error) {
      console.error("Error adding play to collection:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!addedPlays || addedPlays.length === 0) {
      setMessage({
        text: "Please select at least one play to add.",
        status: "error",
      });
      setIsValidForm(false);
      return;
    }

    const addPromises = addedPlays.map((play) => handleNewPlay(play.play.id));
    await Promise.all(addPromises); // Wait for all plays to be added

    setAddedPlays(null);
    setIsValidForm(false);
    handleClose(); // Close modal after successful submission
    setReload(true); // Trigger reload in the parent component
  };

  useEffect(() => {
    // This channel is for real-time updates, which is good.
    // It should also re-fetch based on the current search term.
    const channel = supabase
      .channel("collection_plays_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collection_plays" },
        () => {
          void fetchPlays(searchTerm); // Re-fetch with current search term
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchPlays, searchTerm]);

  useEffect(() => {
    // Fetch plays initially when modal opens or playIds/affIds change
    // Always call with the current searchTerm state, which will be empty on initial open
    if (isOpen) {
      void fetchPlays(searchTerm);
    }
  }, [isOpen, playIds, affIds, fetchPlays, searchTerm]); // Depend on isOpen, playIds, affIds, fetchPlays, and searchTerm

  useEffect(() => {
    // Validate form based on addedPlays
    setIsValidForm(Boolean(addedPlays && addedPlays.length > 0));
  }, [addedPlays]);

  // If the modal is not open, return null. This component will only render its
  // ModalSkeleton content when 'isOpen' is true.
  if (!isOpen) {
    return null;
  }

  return (
    <ModalSkeleton
      isOpen={isOpen}
      setIsOpen={setIsOpen} // Pass setIsOpen directly to ModalSkeleton
      handleClose={handleClose}
      title="Add Plays to Collection"
    >
      <Box
        component="form" // Use Box as a form for consistent styling
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 2, // Consistent gap
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            gap: 2, // Consistent gap
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Select plays to add to this collection. Only plays you can access
            and that are not already in this collection will appear.
          </Typography>
          <Box className="w-full">
            <Autocomplete
              id="plays-autocomplete" // Unique ID
              onChange={handleChange}
              options={plays} // `plays` is now always an array
              getOptionLabel={(option) =>
                `${option.video.title} - ${option.play.title}`
              }
              renderOption={(props, option) => (
                <li {...props} key={option.play.id}>
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {option.team && (
                        <TeamLogo tm={option.team} size={25} inactive={true} />
                      )}
                      {option.play.highlight && (
                        <StarIcon color="secondary" fontSize="small" />
                      )}
                    </Box>
                    <Divider
                      orientation="vertical"
                      flexItem
                      variant="middle"
                      sx={{ mx: 0.5 }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      {/* Allows text to wrap */}
                      <Typography
                        variant="caption"
                        sx={{ display: "block", fontWeight: "bold" }}
                      >
                        {option.video.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {option.author.name}: {option.play.title} (
                        {convertTimestamp(option.play.created_at)})
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
              filterSelectedOptions
              multiple
              loading={searchLoading} // Show loading indicator in Autocomplete
              onInputChange={(_event, newInputValue) => {
                debouncedFetchPlays(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Plays"
                  placeholder="Search for plays..."
                  id="plays-for-collection-input" // Unique ID
                  name="plays-for-collection-input"
                  fullWidth
                  size="small" // Consistent size
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              limitTags={3}
            />
            {/* Display message if no plays are found after search/initial load */}
            {!searchLoading && plays.length === 0 && searchTerm === "" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No plays available to add.
              </Typography>
            )}
            {!searchLoading && plays.length === 0 && searchTerm !== "" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No plays found matching "{searchTerm}".
              </Typography>
            )}
          </Box>
          <FormMessage message={message} />
        </Box>
        <FormButtons
          isValid={isValidForm}
          handleCancel={handleClose}
          submitTitle="ADD PLAYS"
        />
      </Box>
    </ModalSkeleton>
  );
};

export default PlaysToCollectionModal;
