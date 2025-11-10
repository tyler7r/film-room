import {
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  TextField,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
// Dependency now resolved by the new file
import { fetchTeamMembers } from "./sendMentions";

// --- Type Definitions ---

/** Defines the structure for a user who can be mentioned. */
type MentionUser = {
  id: string; // The user's Supabase ID (UUID)
  name: string; // The user's display name
};

/** Defines the props expected by the MentionInput component. */
type MentionInputProps = {
  teamId: string | null; // The ID of the current team to fetch members for.
  value: string; // The current value of the input.
  // Handler for text change and mention list update.
  onChange: (value: string, mentionedIds: string[]) => void;
  label: string; // The label for the TextField.
  endAdornment: React.ReactNode; // Adornment (like a Send button) for the end of the input.
  entityType: "comment" | "reply";
};

// --- Component ---

const MentionInput = ({
  teamId,
  value,
  onChange,
  label,
  endAdornment,
  entityType,
  ...rest
}: MentionInputProps) => {
  // Explicitly typing useRef hooks
  const inputRef = useRef<HTMLInputElement>(null);
  // popperAnchorRef will point to the input's wrapper element
  const popperAnchorRef = useRef<HTMLDivElement | null>(null);

  // Explicitly typing useState hooks
  const [allUsers, setAllUsers] = useState<MentionUser[]>([]);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [mentionQuery, setMentionQuery] = useState<string>("");

  // --- Utility Functions ---

  /**
   * Parses the text content for all recognized user mentions (@[user name])
   * and maps them back to their user IDs.
   */
  const extractMentionedIds = useCallback(
    (text: string): string[] => {
      const mentionedIds = new Set<string>();

      // Iterate through all known users and check if their name (prefixed with '@')
      // exists in the text. This is the most reliable way to handle spaces and context.
      for (const user of allUsers) {
        // 1. Create a pattern for the user's name, escaped for regex, preceded by '@'.
        // The check includes optional whitespace or punctuation right after the name
        // to ensure we capture the mention even if text immediately follows.
        const escapedName = user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Pattern: '@' followed by the escaped name, followed by a non-word character (like space, punctuation, or end-of-string).
        // The 'i' flag ensures case-insensitivity.
        const userMentionPattern = new RegExp(
          `@${escapedName}(?=\\s|\\W|$)`,
          "gi",
        );

        if (userMentionPattern.test(text)) {
          mentionedIds.add(user.id);
        }
      }

      return Array.from(mentionedIds);
    },
    [allUsers],
  );

  // --- Data Fetching ---

  useEffect(() => {
    // Fetch users when the component loads
    const loadUsers = async () => {
      const users: MentionUser[] = await fetchTeamMembers(teamId);
      setAllUsers(users);
    };
    void loadUsers();
  }, [teamId]);

  // --- Input and Suggestion Logic ---

  /**
   * Handles text input, checking for the '@' trigger and updating suggestions.
   */
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText: string = e.target.value;
    const cursorPosition: number | null = e.target.selectionEnd;

    // 1. Update the parent component's value
    const mentionedIds: string[] = extractMentionedIds(newText);
    onChange(newText, mentionedIds);

    // 2. Check for the '@' trigger right before the cursor
    const lastAt: number = newText.lastIndexOf("@", (cursorPosition ?? 0) - 1);
    const charBeforeAt: string = newText.charAt(lastAt - 1);

    // Check if a valid mention sequence is starting
    if (
      lastAt !== -1 && // '@' symbol found
      // Character before '@' is whitespace or start of string
      (lastAt === 0 || /\s/.test(charBeforeAt)) &&
      // Cursor is inside the potential query area
      (cursorPosition ?? 0) > lastAt
    ) {
      // We are inside a potential mention search
      const query: string = newText.substring(lastAt + 1, cursorPosition ?? 0);

      // Stop suggesting if the query includes a space (meaning the user finished the mention or is typing regular text)
      if (query.includes(" ")) {
        // CRITICAL FIX: Allow spaces in the query to support multi-word names (e.g., "Tyler Randall").
        // We only stop if the space is not the immediate previous character after the last character of the query
        // This logic remains valid for stopping if the user types regular text after the start of a mention query.
      }

      setMentionQuery(query);
      setMentionStartIndex(lastAt);
      setIsSuggesting(true);
      setActiveIndex(-1);

      const filtered: MentionUser[] = allUsers
        .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5); // Limit suggestions to 5
      setSuggestions(filtered);
    } else {
      // No valid mention pattern detected
      setIsSuggesting(false);
      setMentionQuery("");
      setSuggestions([]);
      setMentionStartIndex(-1);
    }
  };

  /**
   * Replaces the mention query with the selected user's name.
   */
  const selectSuggestion = useCallback(
    (user: MentionUser) => {
      if (mentionStartIndex === -1 || !popperAnchorRef.current) return;

      const currentText: string = value;
      // 1. Get the parts before and after the mention query
      const textBefore: string = currentText.substring(0, mentionStartIndex);
      const textAfter: string = currentText.substring(
        // Start position is right after the last character of the query
        mentionStartIndex + 1 + mentionQuery.length,
      );

      // 2. Construct the new text with the full user name (@User Name )
      // We ensure there is exactly one space after the name to act as a clear delimiter/separator.
      const newText = `${textBefore}@${user.name} ${textAfter}`;

      // 3. Close suggestions and update text
      setIsSuggesting(false);
      setSuggestions([]);

      const newMentionedIds: string[] = extractMentionedIds(newText);
      onChange(newText, newMentionedIds);

      // 4. Move cursor to the end of the newly inserted name + space
      const newCursorPosition: number =
        textBefore.length + 1 + user.name.length + 1; // +1 for '@', +1 for trailing space

      // Set timeout ensures cursor position is set after state update triggers re-render
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition,
          );
        }
      }, 0);
    },
    [value, mentionStartIndex, mentionQuery, onChange, extractMentionedIds],
  );

  /**
   * Handles keyboard navigation (Arrow Up/Down, Enter, Escape).
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isSuggesting || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length,
          );
          break;
        case "Enter":
          // Prevent form submission if a suggestion is active
          if (activeIndex !== -1) {
            const selectedUser = suggestions[activeIndex];

            // FIX: Explicitly check if the user object is defined before calling selectSuggestion
            if (selectedUser) {
              e.preventDefault();
              selectSuggestion(selectedUser);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsSuggesting(false);
          setActiveIndex(-1);
          break;
        default:
          break;
      }
    },
    [isSuggesting, suggestions, activeIndex, selectSuggestion],
  );

  // Set the popper's anchor based on the current input ref
  useEffect(() => {
    if (inputRef.current) {
      // The anchor for the Popper needs to be the text input element's container.
      // We must check if the parent element exists and is a DIV, which it should be
      // since the TextField is wrapped in a DIV.
      popperAnchorRef.current = inputRef.current
        .parentElement as HTMLDivElement | null;
    }
  }, []);

  return (
    <ClickAwayListener onClickAway={() => setIsSuggesting(false)}>
      <div className="relative w-full">
        <TextField
          className="w-full"
          multiline
          size="small"
          maxRows={4}
          variant={entityType === "comment" ? "standard" : "outlined"}
          label={label}
          name={entityType === "comment" ? "comment" : "reply"}
          autoComplete="off"
          id="comment"
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{endAdornment}</InputAdornment>
            ),
          }}
          {...rest}
        />

        {/* The Popper displays the suggestions */}
        <Popper
          open={isSuggesting && suggestions.length > 0}
          anchorEl={popperAnchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
          modifiers={[
            {
              name: "offset",
              options: {
                // Adjust position to align with the text field
                offset: [0, 4],
              },
            },
          ]}
        >
          <Paper
            sx={{
              maxWidth: 300,
              width: "100%",
              mt: 1,
              maxHeight: 200,
              overflowY: "auto",
              boxShadow: 3,
            }}
          >
            <List disablePadding>
              {suggestions.map((user, index) => (
                <ListItemButton
                  key={user.id}
                  selected={index === activeIndex}
                  onClick={() => selectSuggestion(user)}
                  onMouseEnter={() => setActiveIndex(index)}
                  sx={{ py: 0.5 }}
                >
                  <ListItemText
                    primary={user.name}
                    primaryTypographyProps={{ fontWeight: "medium" }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default MentionInput;
