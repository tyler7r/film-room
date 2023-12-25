import ClearIcon from "@mui/icons-material/Clear";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { divisions } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { MessageType, TeamHubType } from "~/utils/types";

export const getServerSideProps = (async (
  context: GetServerSidePropsContext,
) => {
  const teamData = await supabase
    .from("teams")
    .select()
    .eq("id", `${context.query.team}`)
    .single();
  const team: TeamHubType = teamData.data;
  return { props: { team } };
}) satisfies GetServerSideProps<{ team: TeamHubType }>;

const TeamSettings = ({
  team,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [details, setDetails] = useState<TeamHubType | undefined>(team);
  const [imagePreview, setImagePreview] = useState<string>(team?.logo!);
  const [pubURL, setPubURL] = useState<string | null>(team!.logo);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails({
      ...details!,
      [name]: value,
    });
  };

  const handleChange = (e: SelectChangeEvent) => {
    setDetails({ ...details!, division: e.target.value });
  };

  const handleImage = async (files: FileList | null) => {
    if (files === null) return;
    const file = files[0];
    if (file && details) {
      // Create image preview src
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Upload image to supabase storage and get image's public URL for use as team logo
      const { data, error } = await supabase.storage
        .from("team_logos")
        .upload(
          `logos/${details.city}-${details.name}-${details.division}.png`,
          file,
          {
            upsert: true,
          },
        );
      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("team_logos").getPublicUrl(data.path);
        setPubURL(publicUrl);
      } else {
        setMessage({
          text: `There was an error with the image you chose to upload. ${error.message}`,
          status: "error",
        });
      }
    }
  };

  useEffect(() => {
    if (details)
      if (details.city === "") {
        setMessage({ text: "Please enter a valid city!", status: "error" });
        setIsValidForm(false);
      } else if (details.name === "") {
        setMessage({
          text: "Please enter a valid team name!",
          status: "error",
        });
        setIsValidForm(false);
      } else if (details.division === "") {
        setMessage({ text: "Please set your team division!", status: "error" });
        setIsValidForm(false);
      } else {
        setMessage({ text: undefined, status: "error" });
        setIsValidForm(true);
      }
  }, [details]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    // Create team with details
    if (details) {
      const { data, error } = await supabase
        .from("teams")
        .update({
          name: details.name,
          city: details.city,
          division: details.division,
          logo: pubURL,
        })
        .eq("id", `${team?.id}`)
        .select()
        .single();
      if (data) {
        setMessage({
          text: "Successfully updated team details!",
          status: "success",
        });
        setTimeout(() => {
          router.push(`/team-hub/${team?.id}`);
        }, 1000);
      } else {
        setMessage({
          text: `There was an error updating the team details. ${error.message}`,
          status: "error",
        });
        setIsValidForm(true);
      }
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col">
        <Typography variant="h1" fontSize={64}>
          Team Settings
        </Typography>
      </div>
      <form
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center"
        onSubmit={handleSubmit}
      >
        <TextField
          className="w-full"
          name="city"
          autoComplete="city"
          required
          id="city"
          label="City"
          type="text"
          autoFocus
          onChange={handleInput}
          value={details?.city}
        />
        <TextField
          className="w-full"
          name="name"
          autoComplete="name"
          required
          id="name"
          label="Name"
          onChange={handleInput}
          value={details?.name}
        />
        <FormControl className="g-4 flex w-full flex-col">
          <InputLabel>Team Division</InputLabel>
          <Select
            native={false}
            label="team-division"
            labelId="Team-Division"
            value={details?.division}
            onChange={handleChange}
            className="w-full text-start"
          >
            <MenuItem value={""}>None</MenuItem>
            {divisions.map((div) => (
              <MenuItem value={div} key={div}>
                {div}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          disabled={!isValidForm}
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
        >
          {imagePreview === "" ? "Upload Logo" : "Change Logo"}
          <input
            id="file_upload"
            type="file"
            onChange={(e) => {
              void handleImage((e.target as HTMLInputElement).files);
            }}
            style={{ display: "none" }}
          />
        </Button>
        {imagePreview !== "" && (
          <Image
            className={`rounded-full border-4 border-solid border-stone-300`}
            src={imagePreview}
            alt="Site logo"
            height={250}
            width={250}
            priority={true}
          />
        )}
        <div className="flex flex-col items-center justify-center"></div>
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
          endIcon={<KeyboardDoubleArrowRightIcon />}
        >
          Continue
        </Button>
        <Button
          variant="outlined"
          size="medium"
          type="button"
          onClick={() => router.push("/signup/team-select")}
          endIcon={<ClearIcon />}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default TeamSettings;
