import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { validatePwdMatch } from "~/utils/helpers";
import { MessageType } from "~/utils/types";

type DetailsType = {
  name: string;
  password: string;
  confirmPwd: string;
};

const SignupDetails = () => {
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [data, setData] = useState<DetailsType>({
    name: "",
    password: "",
    confirmPwd: "",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [showPwd, setShowPwd] = useState<boolean>(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(data);
  };

  useEffect(() => {
    // Update form validity and form message as necessary
    const { name, password, confirmPwd } = data;
    const pwdMatch = validatePwdMatch(password, confirmPwd);

    if (name === "") {
      setMessage({ status: "error", text: "Please enter your name!" });
      setIsValidForm(false);
    } else if (password === "") {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(false);
    } else if (!pwdMatch) {
      setMessage({
        status: "error",
        text: "Please ensure that the passwords match!",
      });
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [data]);

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <Typography variant="h1" fontSize={54}>
        Finish Account
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
      >
        <TextField
          className="w-full"
          name="name"
          autoComplete="full-name"
          required
          id="full-name"
          label="Name"
          type="text"
          autoFocus
          onChange={handleInput}
          value={data.name}
        />
        <TextField
          className="w-full"
          name="password"
          autoComplete="password"
          required
          id="password"
          label="Password"
          type={showPwd ? "text" : "password"}
          autoFocus
          onChange={handleInput}
          value={data.password}
        />
        <TextField
          className="w-full"
          name="confirmPwd"
          autoComplete="confirmPwd"
          required
          id="confirmPwd"
          label="Confirm Password"
          type={showPwd ? "text" : "password"}
          autoFocus
          onChange={handleInput}
          value={data.confirmPwd}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showPwd}
              onChange={() => setShowPwd(!showPwd)}
              size="small"
            />
          }
          labelPlacement="end"
          label="Show Password?"
        />
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};

export default SignupDetails;
