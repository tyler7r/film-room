import ClearIcon from "@mui/icons-material/Clear";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { divisions } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

type TeamDetailsType = {
  city: string;
  name: string;
  division: (typeof divisions)[number];
};

const CreateTeam = () => {
  const { user, setUser } = useAuthContext();
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [details, setDetails] = useState<TeamDetailsType>({
    city: "",
    name: "",
    division: "",
  });

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
        name: details.name,
        city: details.city,
        division: details.division,
        owner: `${user.userId}`,
      })
      .select("id")
      .single();

    // When successfully created, create an owner affiliation of the team for the user
    if (data) {
      setUser({ ...user, currentAffiliation: data.id });
      // Set team id to newly created teams' id
      await supabase
        .from("affiliations")
        .insert({
          team_id: `${data.id}`,
          user_id: `${user.userId}`,
          verified: true,
          role: "owner",
        })
        .select();
      setMessage({ text: "Team successfully created!", status: "success" });
      setTimeout(() => {
        router.push("/create-team/logo");
      }, 1000);
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
