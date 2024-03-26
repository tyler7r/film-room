import ClearIcon from "@mui/icons-material/Clear";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { divisions } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

type TeamDetailsType = {
  city: string;
  name: string;
  division: (typeof divisions)[number];
  isCoach: boolean;
  id: string;
};

const CreateTeam = () => {
  const { user, setUser } = useAuthContext();
  const router = useRouter();
  const genID = v4();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [details, setDetails] = useState<TeamDetailsType>({
    city: "",
    name: "",
    division: "",
    id: genID,
    isCoach: false,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pubURL, setPubURL] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleChange = (e: SelectChangeEvent) => {
    setDetails({ ...details, division: e.target.value });
  };

  const handleImage = async (files: FileList | null) => {
    if (files === null) return;
    const file = files[0];
    if (file) {
      // Create image preview src
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Upload image to supabase storage and get image's public URL for use as team logo
      const { data, error } = await supabase.storage
        .from("team_logos")
        .upload(`logos/${details.id}.png`, file, {
          upsert: true,
        });
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
    if (details.city === "") {
      setMessage({ text: "Please enter a valid city!", status: "error" });
      setIsValidForm(false);
    } else if (details.name === "") {
      setMessage({ text: "Please enter a valid team name!", status: "error" });
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
    const { data, error } = await supabase
      .from("teams")
      .insert({
        id: details.id,
        name: details.name,
        city: details.city,
        division: details.division,
        logo: pubURL,
        owner: `${user.userId}`,
        full_name: `${details.city} ${details.name}`,
      })
      .select()
      .single();

    // When successfully created, create an owner affiliation of the team for the user
    if (data) {
      // Set team id to newly created teams' id
      const aff = await supabase
        .from("affiliations")
        .insert({
          team_id: `${details.id}`,
          user_id: `${user.userId}`,
          verified: true,
          role: `${details.isCoach ? "coach" : "player"}`,
        })
        .select()
        .single();
      setMessage({ text: "Team successfully created!", status: "success" });
      setTimeout(() => {
        router.push("/");
      }, 1000);
      setUser({
        ...user,
        currentAffiliation: {
          team: data,
          role: details.isCoach ? "coach" : "player",
          affId: `${aff.data?.id}`,
        },
      });
    } else {
      setMessage({
        text: `There was a problem creating the team account. ${error.message}`,
        status: "error",
      });
      setIsValidForm(true);
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col">
        <Typography variant="h1" fontSize={64}>
          Create Team
        </Typography>
        <Typography variant="caption" fontWeight="bold" color="primary">
          * You will be the team's account owner *
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
          value={details.city}
        />
        <TextField
          className="w-full"
          name="name"
          autoComplete="name"
          required
          id="name"
          label="Name"
          onChange={handleInput}
          value={details.name}
        />
        <FormControl className="g-4 flex w-full flex-col">
          <InputLabel>Team Division</InputLabel>
          <Select
            native={false}
            label="team-division"
            labelId="Team-Division"
            value={details.division}
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
        <FormControlLabel
          control={
            <Checkbox
              checked={details.isCoach}
              onChange={() =>
                setDetails({ ...details, isCoach: !details.isCoach })
              }
              size="small"
            />
          }
          labelPlacement="start"
          label={
            <Typography fontSize={12} variant="button">
              Are you a coach?
            </Typography>
          }
        />
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

export default CreateTeam;
