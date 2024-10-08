import ClearIcon from "@mui/icons-material/Clear";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { divisions } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

type TeamDetailsType = {
  city: string;
  name: string;
  division: (typeof divisions)[number];
  role: "player" | "coach";
  id: string;
  num: number | null;
};

const CreateTeam = () => {
  const { user, setAffReload } = useAuthContext();
  const { colorText } = useIsDarkContext();

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
    role: "player",
    num: null,
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
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleImage = async (files: FileList | null) => {
    if (files === null) return;
    const file = files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      const { data, error } = await supabase.storage
        .from("team_logos")
        .upload(`logos/${details.id}.png`, file, {
          upsert: true,
          cacheControl: "60",
        });
      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("team_logos").getPublicUrl(data.path);
        setPubURL(publicUrl);
      } else {
        setMessage({
          text: `There was an error with the image you chose to upload: ${error.message}`,
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

    const { data, error } = await supabase
      .from("teams")
      .insert({
        id: details.id,
        name: details.name,
        city: details.city,
        division: details.division,
        logo: pubURL,
        owner: user.userId,
        full_name: `${details.city} ${details.name}`,
      })
      .select()
      .single();
    if (data) {
      await supabase
        .from("affiliations")
        .insert({
          team_id: details.id,
          user_id: `${user.userId}`,
          verified: true,
          role: details.role,
          number: details.role === "coach" ? null : details.num,
        })
        .select()
        .single();
      setMessage({ text: "Team successfully created!", status: "success" });
      setTimeout(() => {
        void router.push("/");
        setAffReload(true);
      }, 500);
    } else {
      setMessage({
        text: `There was a problem creating the team account: "${error.message}"`,
        status: "error",
      });
      setIsValidForm(true);
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn) {
      void router.push("/login");
    }
  }, [user.isLoggedIn]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4">
      <div className="flex flex-col items-center justify-center gap-1">
        <PageTitle size="x-large" title="Create Team" />
        <div className={`text-sm font-bold ${colorText} tracking-tight`}>
          * You will be the team's account owner *
        </div>
      </div>
      <form
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center md:w-3/5 lg:w-1/2"
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
        <FormControl className="flex w-full flex-col">
          <InputLabel htmlFor="team-division">Team Division</InputLabel>
          <Select
            native={false}
            label="team-division"
            labelId="Team-Division"
            value={details.division}
            onChange={handleChange}
            className="w-full text-start"
            id="division"
            name="division"
          >
            <MenuItem value={""}>No Division</MenuItem>
            {divisions.map((div) => (
              <MenuItem value={div} key={div}>
                {div}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="flex w-full items-center justify-center gap-2">
          <FormControl className="flex w-full flex-col">
            <InputLabel htmlFor="user-role">Your Role</InputLabel>
            <Select
              native={false}
              label="user-role"
              labelId="User-Role"
              value={details.role}
              onChange={handleChange}
              className="w-full text-start"
              id="user-role"
              name="role"
            >
              <MenuItem value="player" key="player">
                Player
              </MenuItem>
              <MenuItem value="coach" key="coach">
                Coach
              </MenuItem>
            </Select>
          </FormControl>
          {details.role === "player" && (
            <TextField
              size="small"
              name="num"
              autoComplete="num"
              id="num"
              label="Number"
              type="number"
              onChange={handleInput}
              value={details.num ?? ""}
            />
          )}
        </div>
        <Button
          disabled={!isValidForm}
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
        >
          {imagePreview === "" ? "Upload Logo" : "Change Logo"}
          <input
            name="file-upload"
            id="file_upload"
            type="file"
            accept=".png"
            onChange={(e) => {
              void handleImage((e.target as HTMLInputElement).files);
            }}
            hidden
          />
        </Button>
        <div className={`text-sm font-bold ${colorText} tracking-tight`}>
          * Image must be a png file *
        </div>
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
          onClick={() => void router.push("/team-select")}
          endIcon={<ClearIcon />}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default CreateTeam;
