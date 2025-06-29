import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import { Autocomplete, Divider, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState, type SyntheticEvent } from "react";
import TeamLogo from "~/components/teams/team-logo";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MessageType, PlayPreviewType } from "~/utils/types";

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
  const router = useRouter();

  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [addedPlays, setAddedPlays] = useState<PlayPreviewType[] | null>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.userId) {
      setIsOpen(true);
    } else void router.push("/login");
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessage({ text: undefined, status: "error" });
    setAddedPlays(null);
  };

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: PlayPreviewType[],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (newValue.length > 0) {
      setAddedPlays(newValue);
    } else setAddedPlays(null);
  };

  const fetchPlays = async () => {
    const plays = supabase
      .from("play_preview")
      .select("*")
      .order("play->>created_at", { ascending: false });
    if (playIds) {
      void plays.not("play->>id", "in", `(${playIds})`);
    }
    if (affIds && affIds.length > 0) {
      void plays.or(
        `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
      );
    } else {
      void plays.eq("play->>private", false);
    }
    const { data } = await plays;
    if (data && data.length > 0) {
      setPlays(data);
    } else setPlays(null);
  };

  const handleNewPlay = async (playId: string) => {
    await supabase.from("collection_plays").insert({
      collection_id: collectionId,
      play_id: playId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addedPlays?.forEach((play) => void handleNewPlay(play.play.id));
    setAddedPlays(null);
    setIsValidForm(false);
    handleClose();
    setReload(true);
  };

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collection_plays" },
        () => {
          void fetchPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchPlays();
  }, [playIds]);

  useEffect(() => {
    if (addedPlays && addedPlays.length > 0) setIsValidForm(true);
    else setIsValidForm(false);
  }, [addedPlays]);

  return !isOpen ? (
    <StandardPopover
      content="Add plays to the Collection"
      children={
        <IconButton onClick={handleOpen} size="small">
          <AddIcon color="primary" fontSize="large" />
        </IconButton>
      }
    />
  ) : (
    <ModalSkeleton
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      handleClose={handleClose}
      title="Add to Collection"
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-4 p-2">
          {plays && (
            <div className="w-full">
              <Autocomplete
                id="mentions"
                onChange={(event, newValue) => handleChange(event, newValue)}
                options={plays}
                getOptionLabel={(option) =>
                  `${option.video.title} - ${option.play.title}`
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.play.id}>
                    <div className="flex w-full items-center justify-center gap-4">
                      <div className="flex items-center justify-center gap-2">
                        {option.team && (
                          <TeamLogo
                            tm={option.team}
                            size={25}
                            inactive={true}
                          />
                        )}
                        {option.play.highlight && (
                          <StarIcon color="secondary" />
                        )}
                        <div className="text-xs font-light">
                          {convertTimestamp(option.play.created_at)}
                        </div>
                      </div>
                      <Divider
                        orientation="vertical"
                        flexItem
                        variant="middle"
                      />
                      <div className="flex flex-col items-center justify-center">
                        <PageTitle title={option.video.title} size="xx-small" />
                        <div className="flex gap-1">
                          <div className="text-center text-sm">
                            <strong className="text-sm font-bold tracking-tight">
                              {option.author.name}:
                            </strong>{" "}
                            {option.play.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
                filterSelectedOptions
                multiple
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Plays"
                    placeholder="Plays..."
                    id="plays-for-collection"
                    name="plays-for-collection"
                  />
                )}
                limitTags={3}
              />
            </div>
          )}
        </div>
        <FormMessage message={message} />
        <FormButtons
          isValid={isValidForm}
          handleCancel={handleClose}
          submitTitle="SUBMIT"
        />
      </form>
    </ModalSkeleton>
  );
};

export default PlaysToCollectionModal;
